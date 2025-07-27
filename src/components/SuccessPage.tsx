import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import '../styles/SuccessPage.css';

function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // decode booking data from URL
  const decodeBookingDataFromUrl = (encodedData: string) => {
    try {
      console.log("Decoding data from URL, length:", encodedData.length);
      const jsonString = atob(encodedData);
      const bookingData = JSON.parse(jsonString);
      console.log("Successfully decoded booking data:", bookingData);
      return bookingData;
    } catch (error) {
      console.error("Error decoding booking data from URL:", error);
      return null;
    }
  };

  // Extract booking data from various sources
  const extractBookingData = async () => {
    console.log("=== EXTRACTING BOOKING DATA ===");
    
    // Method 1: Try to get data from location.state (if navigated via React Router)
    if (location.state) {
      console.log("Found data in location.state:", location.state);
      setBookingData(location.state);
      setLoading(false);
      return;
    }
    
    // Method 2: Try to get data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL params:", window.location.search);
    
    // Check for our custom data parameter
    const encodedData = urlParams.get('data');
    if (encodedData) {
      console.log("Found encoded data in URL parameters");
      const decodedData = decodeBookingDataFromUrl(encodedData);
      if (decodedData) {
        setBookingData(decodedData);
        setLoading(false);
        return;
      }
    }
    
    // Method 3: Handle Stripe redirect parameters with payment_intent
    if (urlParams.has('payment_intent')) {
      console.log("Found Stripe redirect with payment_intent, checking localStorage fallback");
      
      // Fallback: Try localStorage as backup
      try {
        const storedData = localStorage.getItem('pendingBookingData');
        console.log("localStorage data found:", !!storedData);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log("Successfully parsed localStorage data:", parsedData);
          setBookingData(parsedData);
          // Remove the data after successful retrieval
          localStorage.removeItem('pendingBookingData');
          console.log("Cleaned up localStorage data");
          setLoading(false);
          return;
        } else {
          console.log("No data found in localStorage");
        }
      } catch (error) {
        console.error("Error reading/parsing localStorage data:", error);
      }
    }
    
    // Method 4: No data found anywhere
    console.log("No booking data found in any location");
    setBookingData(null);
    setLoading(false);
  };

  useEffect(() => {
    console.log("Success page loaded!");
    console.log("Location state:", location.state);
    console.log("URL search params:", window.location.search);
    console.log("Current localStorage content:", localStorage.getItem('pendingBookingData'));
    
    extractBookingData();
  }, [location.state, location.search]);

  // Helper function to format dates for display
  const formatDisplayDate = (dateStr: any) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="success-page">
        <div className="progress-bar">
          <div className="progress-step completed">✓</div>
          <div className="progress-step completed">✓</div>
          <div className="progress-step completed">✓</div>
          <div className="progress-step completed">✓</div>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Processing...</h1>
          <p>Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  // Extract individual fields from booking data with fallbacks
  const bookingId = bookingData.id;
  const firstName = bookingData.first_name;
  const lastName = bookingData.last_name;
  const salutation = bookingData.salutations;
  const phoneNumber = bookingData.phone_num;
  const emailAddress = bookingData.email;
  const specialRequest = bookingData.msg_to_hotel;
  
  // Hotel and booking information
  const hotelName = bookingData.hotelName;
  const hotelAddr = bookingData.hotelAddr;
  const rates = bookingData.rates;
  const checkin = bookingData.start_date;
  const checkout = bookingData.end_date;
  const noAdults = bookingData.adults;
  const noChildren = bookingData.children;
  const duration = bookingData.nights;
  const totalPrice = bookingData.price;
  
  // Additional data
  const destId = bookingData.dest_id;
  const hotelId = bookingData.hotel_id;
  const userRef = bookingData?.user_ref;
  const roomType = bookingData?.room_type;

  // Debug log to see extracted values
  console.log("=== EXTRACTED VALUES ===");
  console.log("Booking ID:", bookingId);
  console.log("Hotel Name:", hotelName);
  console.log("Guest Name:", firstName, lastName);
  console.log("bookingData exists:", !!bookingData);
  console.log("bookingData keys:", bookingData ? Object.keys(bookingData) : 'none');

  // Show error if no booking data found
  const hasEssentialData = bookingData && (bookingData.id) && bookingData.hotelName;
  
  console.log("=== DATA VALIDATION ===");
  console.log("bookingData exists:", !!bookingData);
  console.log("has booking ID:", !!(bookingData.id));
  console.log("has hotel name:", !!bookingData.hotelName);
  console.log("hasEssentialData:", hasEssentialData);
  
  if (!hasEssentialData) {
    return (
      <div>
        <h1>Fail Try</h1>
      </div>
    );
  }

  return (
    <div className="success-page">
      {/* Progress Bar - All steps completed */}
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
            <strong>Booking ID: {bookingId}</strong>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="booking-confirmation-card">
          <h3>Booking Details</h3>
          
          {/* Hotel Information */}
          <div className="detail-section">
            <h4>Hotel Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Hotel:</strong>
                <span>{hotelName}</span>
              </div>
              <div className="detail-item">
                <strong>Address:</strong>
                <span>{hotelAddr}</span>
              </div>
              <div className="detail-item">
                <strong>Room Type:</strong>
                <span>{roomType}</span>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div className="detail-section">
            <h4>Stay Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Check-in:</strong>
                <span>{formatDisplayDate(checkin)}</span>
              </div>
              <div className="detail-item">
                <strong>Check-out:</strong>
                <span>{formatDisplayDate(checkout)}</span>
              </div>
              <div className="detail-item">
                <strong>Duration:</strong>
                <span>{duration} {duration === 1 ? 'night' : 'nights'}</span>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="detail-section">
            <h4>Guest Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Guest Name:</strong>
                <span>{`${salutation} ${firstName} ${lastName}`.trim()}</span>
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                <span>{emailAddress}</span>
              </div>
              <div className="detail-item">
                <strong>Phone:</strong>
                <span>{phoneNumber}</span>
              </div>
              <div className="detail-item">
                <strong>Adults:</strong>
                <span>{noAdults}</span>
              </div>
              {(noChildren && noChildren > 0) && (
                <div className="detail-item">
                  <strong>Children:</strong>
                  <span>{noChildren}</span>
                </div>
              )}
            </div>
          </div>

          {/* Special Requests */}
          {specialRequest && (
            <div className="detail-section">
              <h4>Special Requests</h4>
              <div className="special-request-box">
                {specialRequest}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="detail-section">
            <h4>Payment Summary</h4>
            <div className="payment-summary">
              <div className="payment-row">
                <span>Room Rate ({duration} {duration === 1 ? 'night' : 'nights'}):</span>
                <span>${rates} SGD</span>
              </div>
              <div className="payment-row total">
                <strong>Total Paid:</strong>
                <strong>${totalPrice} SGD</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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


        {/* Debug Information (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', fontSize: '12px' }}>
            <strong>This part just for me to check first, can remove in final implementation  </strong>
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify(bookingData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuccessPage;