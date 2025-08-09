import React, { useState, useEffect } from "react";
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
  const [checkinDate, setCheckinDate] = useState<Date | null>(
    addDays(new Date(), 3)
  );
  const [checkoutDate, setCheckoutDate] = useState<Date | null>(
    addDays(new Date(), 4)
  );
  const [rooms, setRooms] = useState(1);
  const [guestsPerRoom, setGuestsPerRoom] = useState<RoomGuests[]>([
    { adults: 2, children: 0 },
  ]);
  const [error, setError] = useState("");
  const minCheckinDate = addDays(new Date(), 3);
  const minCheckoutDate = checkinDate
    ? addDays(checkinDate, 1)
    : addDays(minCheckinDate, 1);
  console.log("Current state:", {
    checkinDate,
    checkoutDate,
    minCheckoutDate,
    "checkout >= minCheckout": checkoutDate && checkoutDate >= minCheckoutDate,
  });

  useEffect(() => {
    if (!checkinDate) return;

    const newMinCheckout = addDays(checkinDate, 1);
    if (!checkoutDate || checkoutDate <= checkinDate) {
      setCheckoutDate(newMinCheckout);
    }
  }, [checkinDate]);

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

    //normalized dates to midnight for proper comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); //set to midnight

    const checkinNormalized = new Date(checkinDate);
    checkinNormalized.setHours(0, 0, 0, 0); //set to midnight

    const minDateNormalized = addDays(today, 3);

    if (checkinNormalized < minDateNormalized) {
      setError("Check-in date must be at least 3 days in advance");
      return;
    }

    if (checkoutDate <= checkinDate) {
      setError("Check-out date must be after check-in date");
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
    const currentAdults = updatedGuests[index].adults;
    const currentChildren = updatedGuests[index].children;
    const current = updatedGuests[index][type];
    const newValue = Math.max(0, current + delta); //no negative vals
    updatedGuests[index] = { ...updatedGuests[index], [type]: newValue };

    if (type === "adults") {
      const newAdults = currentAdults + delta;
      //ensure at least 1 adult
      if (newAdults < 1) return;
      updatedGuests[index].adults = Math.max(0, newAdults);
    } else if (type === "children") {
      const newChildren = currentChildren + delta;
      if (currentAdults === 0 && newChildren < 1) return;
      updatedGuests[index].children = Math.max(0, newChildren);
    }
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
        <small className="date-requirement" style={{ visibility: "hidden" }}>
          (Placeholder to align height)
        </small>
      </div>

      {/* Date Pickers */}
      <div className="form-group">
        <label>Check-in</label>
        <DatePicker
          selected={checkinDate}
          onChange={(date) => {
            console.log("Check-in changed to:", date);
            setCheckinDate(date);
          }}
          minDate={minCheckinDate}
          className="date-picker"
          dateFormat="dd/MM/yyyy"
        />
        <small className="date-requirement">
          (Must be at least 3 days in advance)
        </small>
      </div>

      <div className="form-group">
        <label>Check-out</label>
        <DatePicker
          key={checkinDate?.getTime()}
          selected={checkoutDate}
          dateFormat="dd/MM/yyyy"
          onChange={(date) => {
            console.log("Checkout selected:", date);
            setCheckoutDate(date);
          }}
          minDate={
            checkinDate ? addDays(checkinDate, 1) : addDays(minCheckinDate, 1)
          }
          className="date-picker"
        />
        <small className="date-requirement" style={{ visibility: "hidden" }}>
          (Placeholder to align height)
        </small>
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
