import { useNavigate } from "react-router-dom";
import React, {use, useState} from 'react';

import '../styles/BookingConfirmation.css';
import hotelRoom from '../assets/Hotel_room.jpg';


function Booking(){

    const navigate = useNavigate();

    // FOR TESTING
    const dummyHotelId = "Dummy Hotel ID test 1"
    const dummyDestId = "Dummy Destination ID test 1";
    const dummyHotelName = "Pan Pacific Singapore";
    const dummyHotelAddr = "7 Raffles Boulevard, Marina Square, Singapore 039595";
    const dummyKey = "dummyKey";
    const dummyRates = 254;
    const dummyNoAdults = 2;
    const dummyNoChildren = 3;
    const dummyDate = new Date();
    const dummyDate2 = new Date();
    const roomType = "Deluxe Room";
    const userRef = "dummyUserRef";
    dummyDate2.setDate(dummyDate2.getDate() + 3);

    const [authToken, setAuthToken] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [salutation, setSalutation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');

    const [country, setCountry] = useState('');
    const [countryCode, setCountryCode] = useState('');


    const testRegisterAccount = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthToken("abcdefghijklm123");
        setFirstName("Bugger");
        setLastName("Smith");
        setSalutation("They");
        setPhoneNumber("65 12341234");
        setEmailAddress("abc@gmail.com");
        // set country and country code to pass the GuestInfo page validation
        setCountry("Singapore");
        setCountryCode("65");
    }

    const unsetAccount = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthToken('');
        setFirstName('');
        setLastName('');
        setSalutation('');
        setPhoneNumber('');
        setEmailAddress('');
    }


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigate("/guestinfo", 
            {state: {
                hotelId: dummyHotelId,
                destId: dummyDestId, 
                hotelName: dummyHotelName,
                hotelAddr: dummyHotelAddr,
                key: dummyKey,
                rates: dummyRates,
                checkin: dummyDate,
                checkout: dummyDate2,
                noAdults: dummyNoAdults,
                noChildren: dummyNoChildren,
                firstName: firstName,
                authToken: authToken,
                lastName: lastName,
                salutation: salutation,
                phoneNumber: phoneNumber,
                emailAddress: emailAddress,
                roomType: roomType,
                userRef: userRef,
                country: country,
                countryCode: countryCode
            }});
    }

    const formatDisplayDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${day} ${month}`;
    };

    const calculateNights = () => {
        const timeDiff = dummyDate2.getTime() - dummyDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    const calculateTotalPrice = () => {
        return dummyRates * calculateNights();
    };
    

    return (
        <div className="booking-info-page">
            {/* Progress Bar */}
            <div className="progress-bar">
                <div className="progress-step active">1</div>
                <div className="progress-step">2</div>
                <div className="progress-step">3</div>
                <div className="progress-step">4</div>
            </div>

            <h1>Booking Information</h1>

            <div className="booking-container">
                <div className="booking-details">
                    {/* Combined Hotel and Room Information */}
                    <div className="hotel-room-section">
                        <div className="hotel-room-content">

                            <div className="hotel-room-info">
                                <div className="room-details">
                                    <h2>{roomType}</h2>
                                </div>

                                <h3>{dummyHotelName}</h3>
                                <p className="hotel-address">{dummyHotelAddr}</p>
                                
                            </div>
                            
                            <div className="hotel-room-image">
                                <img 
                                    src={hotelRoom} 
                                    alt={roomType}
                                    className="room-image"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date Information */}
                    <div className="date-selection">
                        <div className="date-field">
                            <label>Check-in Date</label>
                            <span className="date-display">{formatDisplayDate(dummyDate)}</span>
                        </div>

                        <div className="date-field">
                            <label>Check-out Date</label>
                            <span className="date-display">{formatDisplayDate(dummyDate2)}</span>
                        </div>
                    </div>

                    {/* Guest Information */}
                    <div className="guest-info">
                        <div className="guest-field">
                            <label>Guests: </label>
                            <span>{dummyNoAdults} adults{dummyNoChildren > 0 ? `, ${dummyNoChildren} children` : ''}</span>
                        </div>
                        <div className="guest-field">
                            <label>Duration: </label>
                            <span>{calculateNights()} nights</span>
                        </div>
                        <div className="guest-field">
                            <label>Per night: </label>
                            <span>${dummyRates} SGD</span>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="pricing-summary">
                        <div className="pricing-display">
                            <p>You will pay <strong>SGD {calculateTotalPrice()}</strong></p>
                            <p>for <strong>{calculateNights()} nights</strong></p>
                        </div>
                    </div>

                    {/* Account Management Section */}
                    <div className="account-section">
                        <h4>Account Information</h4>
                        
                        {authToken ? (
                            <div className="user-info-preview">
                                <div className="account-display">
                                    <div className="account-field">
                                        <label>Name:</label>
                                        <span>{firstName} {lastName}</span>
                                    </div>
                                    <div className="account-field">
                                        <label>Salutation:</label>
                                        <span>{salutation}</span>
                                    </div>
                                    <div className="account-field">
                                        <label>Phone Number:</label>
                                        <span>{phoneNumber}</span>
                                    </div>
                                    <div className="account-field">
                                        <label>Email Address:</label>
                                        <span>{emailAddress}</span>
                                    </div>
                                </div>
                                
                                <div className="account-actions">
                                    <form onSubmit={unsetAccount}>
                                        <button type="submit" className="cancel-btn">
                                            Log Out
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="no-account">
                                <p>No account logged in</p>
                                <div className="account-actions">
                                    <form onSubmit={testRegisterAccount}>
                                        <button type="submit" className="book-btn">
                                            Log in Account
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="booking-actions">
                        <form onSubmit={handleSubmit}>
                            <button type="submit" className="book-btn">
                                Confirm Booking
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Booking;