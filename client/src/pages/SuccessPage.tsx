import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import formatDisplayDate from '../lib/FormatDisplayDate';
import '../styles/SuccessPage.css'
import EmptyNavBar from "../components/EmptyNavBar";
import { ClipLoader } from "react-spinners";

function SuccessPage() {
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const navigate = useNavigate();

  // Disable back button during loading and saving
  useEffect(() => {
    if (loading || saving) {
      console.log('Success page loading/saving - disabling back button');
      
      window.history.pushState({ loading: true }, '', window.location.pathname);
      
      const handleBackButton = (event:any) => {
        console.log('Back button blocked during loading/saving');
        event.preventDefault();
        event.stopImmediatePropagation();
        alert('Please wait while we process your booking. Do not use the back button.');
        window.history.pushState({ loading: true }, '', window.location.pathname);
        return false;
      };

      window.addEventListener('popstate', handleBackButton);
      
      return () => {
        window.removeEventListener('popstate', handleBackButton);
      };
    }
  }, [loading, saving]);

  // After saving is complete, prevent going back to payment page
  useEffect(() => {
    if (!loading && !saving && bookingData) {
      console.log('Booking saved - setting up permanent back button protection');
      
      // Replace current history to remove payment page from history
      window.history.replaceState(null, '', window.location.pathname);
      window.history.pushState({ preventBack: true }, '', window.location.pathname);
      
      const handleBackButton = () => {
        console.log('Back button pressed after booking saved - redirecting to home');
        navigate('/');
      };

      window.addEventListener('popstate', handleBackButton);
      
      return () => {
        window.removeEventListener('popstate', handleBackButton);
      };
    }
  }, [loading, saving, bookingData, navigate]);

  async function saveBooking(bookingData: any) {
    if (!bookingData) {
      console.log('No booking data to save');
      return;
    }

    let contents = null;
    
    console.log('Saving booking data:', JSON.stringify(bookingData));
    
    if (bookingData.userRef) {
      contents = { // logged in
        nights: bookingData.duration,
        adults: bookingData.noAdults,
        children: bookingData.noChildren || 0,
        msg_to_hotel: bookingData.specialRequest || "",
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
        msg_to_hotel: bookingData.specialRequest || "",
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
      try {
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(contents)
        });
        
        console.log("API response:", response);
        const data = await response.json();
        console.log("Response data:", data);

        if (response.ok) {
          setBookingId(data.booking_id);
          console.log('Booking saved successfully with ID:', data.booking_id);
          
          // Clear session data after successful save
          sessionStorage.removeItem('pendingBookingData');
          
          return data;
        }
      } catch (error) {
        console.error('Error saving booking:', error);
      }
    }
  }

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
      <div className="loader-overlay">
        <ClipLoader
          size={60}
          color="#0066cc"
          loading={true}
          aria-label="mutating-dots-loading"
        />
        <p>Loading your booking confirmation...</p>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '5px',
          color: '#856404'
        }}>
          <strong>⚠️ Please do not use the back button while we load your booking</strong>
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
    return (
      <div className="loader-overlay">
        <ClipLoader
          size={60}
          color="#0066cc"
          loading={true}
          aria-label="mutating-dots-loading"
        />
        <p>Saving to database</p>
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '5px',
          color: '#856404'
        }}>
          <strong>⚠️ Please do not use the back button while we save your booking</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <EmptyNavBar />

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
                <div className="detail-item">
                  <strong>Children:</strong>
                  <span>{bookingData.noChildren}</span>
                </div>
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
                  <span>Per Night ({bookingData.duration} {bookingData.duration === 1 ? 'night' : 'nights'}):</span>
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
            onClick={() => navigate('/')}
          >
            Book Another Stay
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;