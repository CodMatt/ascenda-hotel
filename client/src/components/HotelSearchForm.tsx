import React, { useState } from 'react';
import { DestinationDropdown } from './DestinationDropdown';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addDays } from 'date-fns';
import { Destination } from '../types/destination';
import '../styles/hotelSearchForm.css';


interface HotelSearchFormProps {
    onSearch: (searchParams: {
        destinationId: string;
        checkin: string;
        checkout: string;
        guests: string;
        lang?: string;
        currency?: string;
        country_code?: string;
    }) => void;
}

const HotelSearchForm: React.FC<HotelSearchFormProps> = ({ onSearch }) => {
    // Form state
    const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
    const [checkinDate, setCheckinDate] = useState<Date | null>(new Date());
    const [checkoutDate, setCheckoutDate] = useState<Date | null>(addDays(new Date(), 3));
    const [rooms, setRooms] = useState(1);
    const [guestsPerRoom, setGuestsPerRoom] = useState<number[]>([2]);
    const [error, setError] = useState('');

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedDestination) {
            setError('Please select a destination');
            return;
        }
        
        if (!checkinDate || !checkoutDate) {
            setError('Please select check-in and check-out dates');
            return;
        }

        const guestsParam = guestsPerRoom.join('|');
        
        onSearch({
            destinationId: selectedDestination.uid,
            checkin: format(checkinDate, 'yyyy-MM-dd'),
            checkout: format(checkoutDate, 'yyyy-MM-dd'),
            guests: guestsParam,
            lang: 'en_US',
            currency: 'SGD',
            country_code: 'SG'
        });
    };

    // Room/guest management
    const handleGuestsChange = (index: number, value: number) => {
        const newGuests = [...guestsPerRoom];
        newGuests[index] = value;
        setGuestsPerRoom(newGuests);
    };

    const addRoom = () => {
        if (rooms < 8) {
            setRooms(rooms + 1);
            setGuestsPerRoom([...guestsPerRoom, 2]);
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
                        minDate={new Date()}
                        className="date-picker"
                    />
                </div>

                <div className="form-group">
                    <label>Check-out</label>
                    <DatePicker
                        selected={checkoutDate}
                        onChange={setCheckoutDate}
                        minDate={checkinDate ? addDays(checkinDate, 1) : addDays(new Date(), 1)}
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
                        <select
                            value={guestsPerRoom[index]}
                            onChange={(e) => handleGuestsChange(index, parseInt(e.target.value))}
                            className="guest-select"
                        >
                            {[1, 2, 3, 4].map((num) => (
                                <option key={num} value={num}>
                                    {num} {num === 1 ? 'guest' : 'guests'}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
                {rooms < 8 && (
                    <button 
                        type="button" 
                        onClick={addRoom}
                        className="add-room"
                    >
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

/* TODO: ADD CSS CLASSES TO STYLE THE COMPONENT
CSS CLASSES TO STYLE:

MAIN STRUCTURE:
1. .hotel-search-form
   - Main form container
   - Controls overall form layout, spacing, background

2. .error-message
   - Error display styling
   - Usually red/warning colors, borders

FORM LAYOUT:
3. .form-group
   - Individual form field containers
   - Controls field spacing and layout

4. .form-row
   - Horizontal layout for date pickers
   - Usually displays items side by side

5. label
   - Form field labels
   - Text styling, positioning above inputs

DATE PICKERS:
6. .date-picker
   - Date picker input styling
   - Border, padding, focus states
   - Note: react-datepicker has its own CSS file imported

ROOMS & GUESTS:
7. .room-guests
   - Individual room configuration container
   - Background, borders, spacing for each room

8. .room-header
   - Room title and remove button container
   - Usually flex layout for space-between

9. .guest-select
   - Dropdown for selecting number of guests
   - Standard select styling

BUTTONS:
10. .remove-room
    - Remove room button (red/destructive styling)
    - Small button, usually secondary style

11. .add-room
    - Add room button (positive/additive styling)
    - Usually dashed border or secondary style

12. .search-button
    - Main call-to-action button
    - Primary button styling, prominent colors

KEY UI BEHAVIORS:
- Form validates destination and dates before submission
- Check-out date automatically adjusts if before check-in
- Rooms can be added (max 8) and removed (min 1)
- Each room can have 1-4 guests
- Error messages appear above form when validation fails
- Date pickers prevent selecting past dates

DESIGN CONSIDERATIONS:
- .form-row should handle responsive layout for date pickers
- .room-guests might need visual separation between rooms
- Buttons should have hover/focus states
- Error messages need attention-grabbing but not overwhelming styling
- The form should be mobile-friendly
*/