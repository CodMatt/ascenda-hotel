import { useLocation, useNavigate } from "react-router-dom";
import React, {use, useState} from 'react';
import '../styles/BookingConfirmation.css'; // to move
import NavBar from "../components/NavBar";

function CheckHotelDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const formatDisplayDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${day} ${month}`;
    };

    const calculateNights = () => {
        const timeDiff = state.checkout.getTime() - state.checkin.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    const calculateTotalPrice = () => {
        return state.rates * calculateNights();
    };

  const state = location.state;

  if (!state) {
    return <div>No booking data received.</div>;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/guestinfo", {
      state: {
        hotelId: state.id,
        destId: state.destId, 
        hotelName: state.hotelName,
        hotelAddr: state.hotelAddress,
        key: state.key,
        rates: state.rates,
        checkin: state.checkin,
        checkout: state.checkout,
        noAdults: state.noAdults,
        noChildren: state.noChildren,
        roomType: state.roomType,
        userRef: state.userRef,

        firstName: firstName,
        authToken: authToken,
        lastName: lastName,
        salutation: salutation,
        phoneNumber: phoneNumber,
        emailAddress: emailAddress,
        country: country,
        countryCode: countryCode
      }
    });
  };

return (
        <div className="booking-info-page">
            <NavBar />
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
                                    <h2>{state.roomType}</h2>
                                </div>

                                <h3>{state.hotelName}</h3>
                                <p className="hotel-address">{state.hotelAddress}</p>
                                
                            </div>
                            
                            <div className="hotel-room-image">
                                <img 
                                    src={state.roomImage} 
                                    alt={state.roomType}
                                    className="room-image"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date Information */}
                    <div className="date-selection">
                        <div className="date-field">
                            <label>Check-in Date</label>
                            <span className="date-display">{formatDisplayDate(state.checkin)}</span>
                        </div>

                        <div className="date-field">
                            <label>Check-out Date</label>
                            <span className="date-display">{formatDisplayDate(state.checkout)}</span>
                        </div>
                    </div>

                    {/* Guest Information */}
                    <div className="guest-info">
                        <div className="guest-field">
                            <label>Guests: </label>
                            <span>{state.noAdults} adults{state.noChildren > 0 ? `, ${state.noChildren} children` : ''}</span>
                        </div>
                        <div className="guest-field">
                            <label>Duration: </label>
                            <span>{calculateNights()} nights</span>
                        </div>
                        <div className="guest-field">
                            <label>Per night: </label>
                            <span>${state.rates} SGD</span>
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

export default CheckHotelDetailsPage;
