import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
//import '../styles/SuccessPage.css';
import formatDisplayDate from '../lib/FormatDisplayDate';






function SuccessForm() {
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(true);

  async function saveBooking(bookingData: any){

    console.log(bookingData)
    let contents = null
    if (bookingData){
      if (bookingData.authToken){ 
      contents = { // logged in
        nights: bookingData.duration,
        adults: bookingData.noAdults,
        children: bookingData.noChildren || 0,
        msg_to_hotel: bookingData.msg_to_hotel  ||"",
        price: bookingData.totalPrice,
        user_ref: bookingData.userRef,
        dest_id:  bookingData.destId,
        hotel_id: bookingData.hotelId,
        start_date: bookingData.checkin,
        end_date: bookingData.checkout,
      }
    } else {
          console.log("authToken", bookingData.authToken)
      contents = { // no acct
        nights: bookingData.duration,
        adults: bookingData.noAdults,
        children: bookingData.noChildren || 0,
        msg_to_hotel: bookingData.msg_to_hotel || "",
        price: bookingData.totalPrice,
        dest_id:  bookingData.destId,
        hotel_id: bookingData.hotelId,
        start_date: bookingData.checkin,
        end_date: bookingData.checkout,
        first_name: bookingData.firstName,
        last_name: bookingData.lastName,
        salutation: bookingData.salutation,
        phone_num:  bookingData.phoneNumber,
        email: bookingData.emailAddress,
        user_ref: null,
      }
    }


    if (contents){
      console.log(contents)
      const response = await fetch('http://localhost:6039/api/booking', { // hardcoded for now
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contents)
      })
      console.log("Response:",response)
      console.log(await response.json()); 

      if (response.ok){
          setSaving(false)
        }
      }
    }
    
  }
  

  // FOR TESTING - WILL BE AUTO-GENERATED IN BACKEND
  const dummyBookingId = "test1_placeholder13131323"

  const navigate = useNavigate();

  const startTime = Date.now();
  // Max try and load for 5 minutes
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


  if (loading){
    return (
      <div className="success-page"> // still loading
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Processing...</h1>
          <p>Loading your booking confirmation...</p>
        </div>
      </div>
    )

  } else {
    if (!bookingData){ // Failed to load booking data

      return (
        <div className="success-page">
          <h1>Error: No booking data found</h1>
          <p> Please contact support.</p>
        </div>
      );
    } else { // Loaded booking data
      // connect to booking API to save
      
      if (saving && bookingData){
        saveBooking(bookingData);
        return <div><h1>Saving to db</h1></div>

      }

      console.log("Loaded booking data:", bookingData);
      console.log("Duration:", bookingData.duration);
      console.log("Rates:", bookingData.rates);
      console.log("Total Price:", bookingData.totalPrice);
      console.log(bookingData.totalPrice)
      return (
        <div className="success-page">
        <div className="progress-bar">
          <div className="progress-step completed">✓</div>
          <div className="progress-step completed">✓</div>
          <div className="progress-step completed">✓</div>
          <div className="progress-step completed">✓</div>
        </div>

      <h1>Booking Confirmed!</h1>

        <div className="success-container">
          {/* Success Message */}
          <div className="success-message-card">
            <h2>Thank you for your booking!</h2>
            <p>Your reservation has been confirmed and you will receive a confirmation email shortly.</p>
            <div className="booking-id-display">
              <strong>Booking ID: {dummyBookingId? dummyBookingId: "no booking ID" }</strong>
            </div>


            <div className="booking-confirmation-card">
          <h3>Booking Details</h3>
          
          {/* Hotel Information */}
          <div className="detail-section">
            <h4>Hotel Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Hotel:</strong>
                    <span>{bookingData.hotelName? bookingData.hotelName : "Failed to save hotel name"}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Address:</strong>
                    <span>{bookingData.hotelAddr? bookingData.hotelAddr : "Failed to save hotel address"}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Room Type:</strong>
                    <span>{bookingData.roomType? bookingData.roomType : "Failed to save room type"}</span>
                  </div>
                </div>
            </div>

            {/* Stay Information */}
            <div className="detail-section">
              <h4>Stay Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Check-in:</strong>
                  <span>{formatDisplayDate(bookingData.checkin? bookingData.checkin : "Failed to save check-in date")}</span>
                </div>
                <div className="detail-item">
                  <strong>Check-out:</strong>
                  <span>{formatDisplayDate(bookingData.checkout? bookingData.checkout : "Failed to save check-out date")}</span>
                </div>
                <div className="detail-item">
                  <strong>Duration:</strong>
                  <span>{bookingData.duration} {bookingData.duration === 1 ? 'night' : 'nights'}</span>
                </div>
              </div>
            </div>

            {/* Guest Information */}
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

            {/* Special Requests */}
            {bookingData.specialRequest && (
              <div className="detail-section">
                <h4>Special Requests</h4>
                <div className="special-request-box">
                  {bookingData.specialRequest}
                </div>
              </div>
            )}

            
            {/* Payment Information */}
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
      
          {/* Progress Bar - All steps completed */}
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
      )

    }
    
  }
  
}

export default SuccessForm;