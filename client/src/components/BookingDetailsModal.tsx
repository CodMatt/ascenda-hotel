import React from "react";
import formatDisplayDate from "../lib/FormatDisplayDate";

interface Booking {
  booking_id: string;
  hotel_id: string;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  price: string;
  nights: number;
  msg_to_hotel: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_salutation: string;
  destination_id: string;
  hotelName: string | null;
  hotelAddress: string | null;
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  if (!isOpen || !booking) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80%",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          ×
        </button>

        <h2>Booking Details</h2>
        
        <div style={{ marginBottom: "1rem" }}>
          <h3>Booking Information</h3>
          <p><strong>Booking ID:</strong> {booking.booking_id}</p>
          <p><strong>Nights:</strong> {booking.nights}</p>
          <p><strong>Total Price:</strong> ${parseFloat(booking.price).toFixed(2)} SGD</p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <h3>Hotel Information</h3>
          <p><strong>Hotel Name:</strong> {booking.hotelName || "Not available"}</p>
          <p><strong>Hotel Address:</strong> {booking.hotelAddress || "Not available"}</p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <h3>Stay Dates</h3>
          <p><strong>Check-in:</strong> {formatDisplayDate(booking.start_date)}</p>
          <p><strong>Check-out:</strong> {formatDisplayDate(booking.end_date)}</p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <h3>Guest Information</h3>
          <p><strong>Adults:</strong> {booking.adults}</p>
          <p><strong>Children:</strong> {booking.children}</p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <h3>Contact Information</h3>
          <p><strong>Name:</strong> {booking.contact_salutation} {booking.contact_first_name} {booking.contact_last_name}</p>
          <p><strong>Email:</strong> {booking.contact_email}</p>
          <p><strong>Phone:</strong> {booking.contact_phone}</p>
        </div>

        {booking.msg_to_hotel && (
          <div style={{ marginBottom: "1rem" }}>
            <h3>Special Requests</h3>
            <p>{booking.msg_to_hotel}</p>
          </div>
        )}

        {/* <button
          onClick={onClose}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            marginTop: "1rem",
          }}
        >
          Close
        </button> */}
      </div>
    </div>
  );
}

export default BookingDetailsModal;