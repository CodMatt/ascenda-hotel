
import formatDisplayDate from '../lib/FormatDisplayDate';
import {useNavigate} from 'react-router-dom'
import EmptyNavBar from './EmptyNavBar'


interface BookingSuccessDetails{
    bookingId: string;
    hotelName: string;
    hotelAddr: String;
    roomType: string;
    checkin: Date;
    checkout: Date;
    duration: number;
    salutation: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    emailAddress: string;
    noAdults: string;
    noChildren: string;
    specialRequest: string;
    rates: number;
    totalPrice: number;
    noRooms: number;
}

const BookingSuccesCard = (details: BookingSuccessDetails) => {
    const navigate = useNavigate();
    
    return(
        <div className="success-page">
      {/* Navigation Bar */}
      <EmptyNavBar />

        <p>No. Rooms: {details.noRooms}</p>
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
            <strong>Booking ID: {details.bookingId || "no booking ID"}</strong>
          </div>

          <div className="booking-confirmation-card">
            <h3>Booking Details</h3>
            
            <div className="detail-section">
              <h4>Hotel Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Hotel:</strong>
                  <span>{details.hotelName || "Failed to save hotel name"}</span>
                </div>
                <div className="detail-item">
                  <strong>Address:</strong>
                  <span>{details.hotelAddr || "Failed to save hotel address"}</span>
                </div>
                <div className="detail-item">
                  <strong>Room Type:</strong>
                  <span>{details.roomType || "Failed to save room type"}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Stay Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Check-in:</strong>
                  <span>{formatDisplayDate(details.checkin || "Failed to save check-in date")}</span>
                </div>
                <div className="detail-item">
                  <strong>Check-out:</strong>
                  <span>{formatDisplayDate(details.checkout || "Failed to save check-out date")}</span>
                </div>
                <div className="detail-item">
                  <strong>Duration:</strong>
                  <span>{details.duration} {details.duration === 1 ? 'night' : 'nights'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Guest Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Guest Name:</strong>
                  <span>{`${details.salutation} ${details.firstName} ${details.lastName}`.trim()}</span>
                </div>
                <div className="detail-item">
                  <strong>Email:</strong>
                  <span>{details.emailAddress}</span>
                </div>
                <div className="detail-item">
                  <strong>Phone:</strong>
                  <span>{details.phoneNumber}</span>
                </div>
                <div className="detail-item">
                  <strong>Adults:</strong>
                  <span>{details.noAdults}</span>
                </div>
                <div className="detail-item">
                  <strong>Children:</strong>
                  <span>{details.noChildren}</span>
                </div>
                
              </div>
            </div>

            {details.specialRequest && (
              <div className="detail-section">
                <h4>Special Requests</h4>
                <div className="special-request-box">
                  {details.specialRequest}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4>Payment Summary</h4>
              <div className="payment-summary">
                <div className="payment-row">
                  <span>Per Night ({details.duration} {details.duration === 1 ? 'night' : 'nights'}):</span>
                  <span>${details.rates} SGD</span>
                </div>
                
                
                <div className="payment-row total">
                  <strong>Total Paid:</strong>
                  <strong>${details.totalPrice} SGD</strong>
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
    )
}

export default BookingSuccesCard;