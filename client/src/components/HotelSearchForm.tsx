import React, { useState } from "react";
import { DestinationDropdown } from "./DestinationDropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays } from "date-fns";
import { Destination } from "../types/destination";
import "../styles/HotelSearchForm.css";

interface HotelSearchFormProps {
  onSearch: (searchParams: {
    destinationId: string;
    checkin: string;
    checkout: string;
    guests: string;
    adults: number;
    children: number;
    lang?: string;
    currency?: string;
    country_code?: string;
  }) => void;
}

type RoomGuests = { adults: number; children: number };

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch }) => {
  // Form state
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [checkinDate, setCheckinDate] = useState<Date | null>(new Date());
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(
    addDays(new Date(), 3)
  );
  const [rooms, setRooms] = useState(1);
  const [guestsPerRoom, setGuestsPerRoom] = useState<RoomGuests[]>([
    { adults: 2, children: 0 },
  ]);
  const [error, setError] = useState("");
  const minCheckinDate = addDays(new Date(), 3);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDestination) {
      setError("Please select a destination");
      return;
    }

    if (!checkinDate || !checkoutDate) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (checkinDate < minCheckinDate) {
      setError("Check-in date must be at least 3 days in advance");
      return;
    }

    const guestsParam = guestsPerRoom
      .map((room) => room.adults + room.children) // total guests in the room
      .join("|"); // e.g. "2|3|4"

    const totalAdults = guestsPerRoom.reduce(
      (sum, room) => sum + room.adults,
      0
    );
    const totalChildren = guestsPerRoom.reduce(
      (sum, room) => sum + room.children,
      0
    );

    onSearch({
      destinationId: selectedDestination.uid,
      checkin: format(checkinDate, "yyyy-MM-dd"),
      checkout: format(checkoutDate, "yyyy-MM-dd"),
      guests: guestsParam,
      adults: totalAdults,
      children: totalChildren,
      lang: "en_US",
      currency: "SGD",
      country_code: "SG",
    });
  };

  // Room/guest management
  const handleGuestsChange = (
    index: number,
    type: "adults" | "children",
    delta: number
  ) => {
    const updatedGuests = [...guestsPerRoom];
    const current = updatedGuests[index][type];
    const newValue = Math.max(0, current + delta); //no negative vals
    updatedGuests[index] = { ...updatedGuests[index], [type]: newValue };
    setGuestsPerRoom(updatedGuests);
  };

  const addRoom = () => {
    if (rooms < 8) {
      setRooms(rooms + 1);
      setGuestsPerRoom([...guestsPerRoom, { adults: 2, children: 0 }]);
    }
  };

  const removeRoom = (index: number) => {
    if (rooms > 1) {
      setRooms(rooms - 1);
      const newGuests = [...guestsPerRoom];
      newGuests.splice(index, 1);
      setGuestsPerRoom(newGuests);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="hotel-search-form">
      {/* <h2>Find Your Hotel</h2> */}

      {error && <div className="error-message">{error}</div>}

      {/* Destination Dropdown */}
      <div className="form-group">
        <label htmlFor="destination">Destination</label>
        <DestinationDropdown
          onSelect={setSelectedDestination}
          selectedDestination={selectedDestination}
        />
      </div>

      {/* Date Pickers */}
      <div className="form-row">
        <div className="form-group">
          <label>Check-in</label>
          <DatePicker
            selected={checkinDate}
            onChange={(date) => {
              setCheckinDate(date);
              if (checkoutDate && date && checkoutDate < date) {
                setCheckoutDate(addDays(date, 1));
              }
            }}
            minDate={minCheckinDate}
            className="date-picker"
          />
          <small className="date-requirement">
            (Must be at least 3 days in advance)
          </small>      
        </div>

        <div className="form-group">
          <label>Check-out</label>
          <DatePicker
            selected={checkoutDate}
            onChange={setCheckoutDate}
            minDate={
              checkinDate ? addDays(checkinDate, 1) : addDays(minCheckinDate, 1)
            }
            className="date-picker"
          />
        </div>
      </div>

      {/* Rooms & Guests */}
      <div className="form-group">
        <label>Rooms & Guests</label>
        {Array.from({ length: rooms }).map((_, index) => (
          <div key={index} className="room-guests">
            <div className="room-header">
              <span>Room {index + 1}</span>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeRoom(index)}
                  className="remove-room"
                >
                  Remove
                </button>
              )}
            </div>
            <div key={index} className="room-guests">
              <div className="room-header">
                {/*<span>Room {index + 1}</span>*/}
              </div>

              <div className="guest-controls">
                <div className="guest-group">
                  <label>Adults</label>
                  <button
                    type="button"
                    onClick={() => handleGuestsChange(index, "adults", -1)}
                  >
                    -
                  </button>
                  <span>{guestsPerRoom[index].adults}</span>
                  <button
                    type="button"
                    onClick={() => handleGuestsChange(index, "adults", 1)}
                  >
                    +
                  </button>
                </div>

                <div className="guest-group">
                  <label>Children</label>
                  <button
                    type="button"
                    onClick={() => handleGuestsChange(index, "children", -1)}
                  >
                    -
                  </button>
                  <span>{guestsPerRoom[index].children}</span>
                  <button
                    type="button"
                    onClick={() => handleGuestsChange(index, "children", 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {rooms < 8 && (
          <button type="button" onClick={addRoom} className="add-room">
            + Add Room
          </button>
        )}
      </div>

      <button type="submit" className="search-button">
        Search Hotels
      </button>
    </form>
  );
};

export default HotelSearchForm;
