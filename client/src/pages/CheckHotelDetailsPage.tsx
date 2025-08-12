import { useLocation, useNavigate } from "react-router-dom";
import React, {use, useState} from 'react';
import '../styles/BookingConfirmation.css'; // to move
import EmptyNavBar from "../components/EmptyNavBar";

import AccountInformation from '../components/AccountInformation';

function CheckHotelDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const formatDisplayDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return `${day} ${month}`;
    };

    const calculateNights = () => {
        const timeDiff = state.checkout.getTime() - state.checkin.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
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
    
        totalPrice: state.price,
        rates: state.rates,

        checkin: state.checkin,
        checkout: state.checkout,
        noNights: calculateNights(),

        noAdults: state.noAdults,
        noChildren: state.noChildren,
        
        roomType: state.roomType,
        noRooms: state.noRooms,

        // to remove and call directly from session storage maybe?
        userRef: sessionStorage.getItem('userId') || "",
        firstName: sessionStorage.getItem('firstName') || "",
        authToken: sessionStorage.getItem('token') || "",
        lastName: sessionStorage.getItem('lastName') || "",
        salutation: sessionStorage.getItem('salutation') || "",
        phoneNumber: sessionStorage.getItem('phoneNumber') || "",
        emailAddress: sessionStorage.getItem('emailAddress') || "",
        country: "", 
        countryCode: ""
      }
    });
  };

  //console.log("noRooms", state.noRooms)
  //console.log("rates", state.rates)
  //console.log("price", state.price)

return (
        <div className="booking-info-page">
            <EmptyNavBar />
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
                                {state.roomImage ? (
                                    <img 
                                        src={state.roomImage} 
                                        alt={state.roomType}
                                        className="room-image"
                                    />
                                ) : (
                                  <div className="room-type-placeholder">
                                    <span>No Image Available</span>
                                  </div>
                                )}
                                

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
                            <label>Number of Rooms: </label>
                            <span>{state.noRooms} rooms</span>
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
                            <p>You will pay <strong>SGD {state.price}</strong></p>
                            <p>for <strong>{calculateNights()} nights</strong></p>
                        </div>
                    </div>

                    {/* Account Management Section */}
                    <AccountInformation/>
                    

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
