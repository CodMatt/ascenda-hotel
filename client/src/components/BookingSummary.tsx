
import formatDisplayDate from '../lib/FormatDisplayDate';
import calculateNights from '../lib/CalculateNights';


interface BookingDetails{
    hotelName: string;
    hotelAddr: String;
    rates: number;
    totalPrice: number;
    checkin: Date;
    checkout: Date;
    noAdults: number;
    noChildren: number;
    noRooms: number;
    
}

const BookingSummary = (bookingdetails: BookingDetails) => {

    

    return (
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <strong>{bookingdetails.hotelName}</strong>
            <p>{bookingdetails.hotelAddr}</p>
          </div>
          <div className="summary-item">
            <strong>Room Type:</strong> Double Room
          </div>
          <div className="summary-item">
            <strong>Check-in:</strong> {formatDisplayDate(bookingdetails.checkin)}
          </div>
          <div className="summary-item">
            <strong>Check-out:</strong> {formatDisplayDate(bookingdetails.checkout)}
          </div>
          <div className="summary-item">
            <strong>Duration:</strong> {calculateNights(bookingdetails.checkin, bookingdetails.checkout)} nights
          </div>
          <div className="summary-item">
            <strong>Adults:</strong> {bookingdetails.noAdults}
          </div>
          {bookingdetails.noChildren > 0 && (
            <div className="summary-item">
              <strong>Children:</strong> {bookingdetails.noChildren}
            </div>
          )}
          <div className="summary-item">
            <strong>No. Rooms:</strong> {bookingdetails.noRooms} rooms
          </div>

          <div className="summary-item total">
            <strong>Total: ${bookingdetails.totalPrice} SGD</strong>
          </div>
        </div>)
}

export default BookingSummary;