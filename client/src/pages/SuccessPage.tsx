import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import formatDisplayDate from '../lib/FormatDisplayDate';
import '../styles/SuccessPage.css'
import NavBar from "../components/NavBar";

function SuccessPage() {
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(true);
  const [bookingId, setBookingId] = useState("");

  async function saveBooking(bookingData: any) {
    let contents = null;
    
    if (bookingData) {
      console.log(JSON.stringify(bookingData))
      if (bookingData.userRef) {

        contents = { // logged in
          nights: bookingData.duration,
          adults: bookingData.noAdults,
          children: bookingData.noChildren || 0,
          msg_to_hotel: bookingData.msg_to_hotel || "",
          price: bookingData.totalPrice,
          user_ref: bookingData.userRef,
          dest_id: bookingData.destId,
          hotel_id: bookingData.hotelId,
          start_date: bookingData.checkin,
          end_date: bookingData.checkout,
        };
      } else {

        contents = { // no account
          nights: bookingData.duration,
          adults: bookingData.noAdults,
          children: bookingData.noChildren || 0,
          msg_to_hotel: bookingData.msg_to_hotel || "",
          price: bookingData.totalPrice,
          dest_id: bookingData.destId,
          hotel_id: bookingData.hotelId,
          start_date: bookingData.checkin,
          end_date: bookingData.checkout,
          first_name: bookingData.firstName,
          last_name: bookingData.lastName,
          salutation: bookingData.salutation,
          phone_num: bookingData.phoneNumber,
          email: bookingData.emailAddress,
          user_ref: null,
        };
      }

      if (contents) {
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(contents)
        
        });
        console.log("contents",contents)

        console.log("response", response)
        const data = await response.json();
        console.log("responsee: ", data);

        if (response.ok) {
          setBookingId(data.booking_id);
          return data; // Return the promise
        }
      }
    }
  }
  

  // FOR TESTING - WILL BE AUTO-GENERATED IN BACKEND
  const navigate = useNavigate();
  const startTime = Date.now();

  function tryLoad() {
    let sessionData = sessionStorage.getItem('pendingBookingData');
    
    if (loading) {
      if (sessionData) {
        setBookingData(JSON.parse(sessionData));
        setLoading(false);
      } else if (Date.now() - startTime > 300000) { // 5 minutes
        setLoading(false);
      }
    }
  }

  useEffect(() => { 
    tryLoad();
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    if (saving && bookingData) {
      saveBooking(bookingData).then(() => {
        if (isMounted) setSaving(false);
      });
    }

    return () => { isMounted = false; };
  }, [saving, bookingData]);

  if (loading) {
    return (
      <div className="success-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Processing...</h1>
          <p>Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="success-page">
        <h1>Error: No booking data found</h1>
        <p>Please contact support.</p>
      </div>
    );
  }

  if (saving) {
    return <div><h1>Saving to db</h1></div>;
  }

  return (
    
    <div className="success-page">
      {/* Navigation Bar */}
      <NavBar />

      <div className="progress-bar">
        <div className="progress-step completed">✓</div>
        <div className="progress-step completed">✓</div>
        <div className="progress-step completed">✓</div>
        <div className="progress-step completed">✓</div>
      </div>

      <h1>Booking Confirmed!</h1>

      <div className="success-container">
        <div className="success-message-card">
          <h2>Thank you for your booking!</h2>
          <p>Your reservation has been confirmed and you will receive a confirmation email shortly.</p>
          <div className="booking-id-display">
            <strong>Booking ID: {bookingId || "no booking ID"}</strong>
          </div>

          <div className="booking-confirmation-card">
            <h3>Booking Details</h3>
            
            <div className="detail-section">
              <h4>Hotel Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Hotel:</strong>
                  <span>{bookingData.hotelName || "Failed to save hotel name"}</span>
                </div>
                <div className="detail-item">
                  <strong>Address:</strong>
                  <span>{bookingData.hotelAddr || "Failed to save hotel address"}</span>
                </div>
                <div className="detail-item">
                  <strong>Room Type:</strong>
                  <span>{bookingData.roomType || "Failed to save room type"}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Stay Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Check-in:</strong>
                  <span>{formatDisplayDate(bookingData.checkin || "Failed to save check-in date")}</span>
                </div>
                <div className="detail-item">
                  <strong>Check-out:</strong>
                  <span>{formatDisplayDate(bookingData.checkout || "Failed to save check-out date")}</span>
                </div>
                <div className="detail-item">
                  <strong>Duration:</strong>
                  <span>{bookingData.duration} {bookingData.duration === 1 ? 'night' : 'nights'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Guest Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Guest Name:</strong>
                  <span>{`${bookingData.salutation} ${bookingData.firstName} ${bookingData.lastName}`.trim()}</span>
                </div>
                <div className="detail-item">
                  <strong>Email:</strong>
                  <span>{bookingData.emailAddress}</span>
                </div>
                <div className="detail-item">
                  <strong>Phone:</strong>
                  <span>{bookingData.phoneNumber}</span>
                </div>
                <div className="detail-item">
                  <strong>Adults:</strong>
                  <span>{bookingData.noAdults}</span>
                </div>
                {(bookingData.noChildren && bookingData.noChildren > 0) && (
                  <div className="detail-item">
                    <strong>Children:</strong>
                    <span>{bookingData.noChildren}</span>
                  </div>
                )}
              </div>
            </div>

            {bookingData.specialRequest && (
              <div className="detail-section">
                <h4>Special Requests</h4>
                <div className="special-request-box">
                  {bookingData.specialRequest}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4>Payment Summary</h4>
              <div className="payment-summary">
                <div className="payment-row">
                  <span>Room Rate ({bookingData.duration} {bookingData.duration === 1 ? 'night' : 'nights'}):</span>
                  <span>${bookingData.rates} SGD</span>
                </div>
                <div className="payment-row total">
                  <strong>Total Paid:</strong>
                  <strong>${bookingData.totalPrice} SGD</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <button 
            className="pay-btn primary"
            onClick={() => window.print()}
          >
            Print Confirmation
          </button>
          <button 
            className="back-btn"
            onClick={() => {
              sessionStorage.removeItem('pendingBookingData');
              navigate('/');
            }}
          >
            Book Another Stay
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;