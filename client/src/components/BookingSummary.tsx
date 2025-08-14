
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
          <div className="summary-item" data-testid="checkin">
            <strong>Check-in:</strong> {formatDisplayDate(bookingdetails.checkin)}
          </div>
          <div className="summary-item" data-testid="checkout">
            <strong>Check-out:</strong> {formatDisplayDate(bookingdetails.checkout)}
          </div>
          <div className="summary-item" data-testid="noNights">
            <strong>Duration:</strong> {calculateNights(bookingdetails.checkin, bookingdetails.checkout)} nights
          </div>
          <div className="summary-item" data-testid="noAdults">
            <strong>Adults:</strong> {bookingdetails.noAdults}
          </div>
          {bookingdetails.noChildren > 0 && (
            <div className="summary-item" data-testid="noChildren">
              <strong>Children:</strong> {bookingdetails.noChildren}
            </div>
          )}
          <div className="summary-item" data-testid="noRooms">
            <strong>No. Rooms:</strong> {bookingdetails.noRooms} rooms
          </div>

          <div className="summary-item total" data-testid="totalPrice">
            <strong>Total: ${bookingdetails.totalPrice} SGD</strong>
          </div>
        </div>)
}

export default BookingSummary;