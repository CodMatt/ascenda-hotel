import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import formatDisplayDate from "../lib/FormatDisplayDate";
import EmptyNavBar from "../components/EmptyNavBar";
import { useAuth } from "../context/AuthContext";
import { fetchHotelDetails } from "../api/hotels";
import BookingDetailsModal from "../components/BookingDetailsModal";
import getHotelImageUrl from "../lib/getHotelImageUrl";
import { ClipLoader } from "react-spinners";


import "../styles/ViewBookingPage.css";

interface Booking {
  booking_id: string;
  hotel_id: string;
  start_date: string;
  end_date: string;
  adults: number;

  children: number;
  price: string;
  destination_id: string;
  hotelName: string | null;
  hotelAddress: string | null;

  hotelImageUrl?: string | null;
  // Add any other fields you want to display

  nights: number;
  msg_to_hotel: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;

  contact_salutation: string;
}

function ViewBookingsPage() {
  const { token } = useAuth(); //get token from context
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBookings() {
      console.log("fetching bookings...");
      console.log("token from context:", token);
      if (!token) {
        console.warn("No token found, cannot fetch bookings.");
        return;
      }
      try {
        const response = await fetch("/api/booking/my-bookings-with-contact", {
          headers: {
            "Content-Type": "application/json",
            // Include auth token if you use bearer tokens
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetch response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Fetch failed:", errorText);
          throw new Error("Failed to fetch bookings");
        }
        const data: Booking[] = await response.json();
        console.log("Fetch bookings data:", data);


        const bookingsWithHotels: Booking[] = await Promise.all(
          data.map(async (booking) => {
            try {
              const hotelData = await fetchHotelDetails(booking.hotel_id);
        
              const img = getHotelImageUrl(hotelData);
        
              return {
                ...booking,
                hotelName: hotelData?.name ?? null,
                hotelAddress: hotelData?.address ?? null,
                hotelImageUrl: img,
              };
            } catch (error) {
              console.warn(`Failed to fetch hotel details for ${booking.hotel_id}:`, error);
              return {
                ...booking,
                hotelName: null,
                hotelAddress: null,
                hotelImageUrl: null,
              };
            }
          })
        );

        setBookings(bookingsWithHotels);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchBookings();
    } else {
      navigate("/login");
    }
  }, [token]);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  if (loading) return (
    <div className="loader-overlay">
        <ClipLoader
            size={60}
            color="#0066cc"
            loading={true}
            aria-label="mutating-dots-loading"
        />
        <p>Loading your booking ...</p>
    </div>
  );
  if (error) return <p>Error: {error}</p>;
  if (bookings.length === 0) return <p>No previous bookings found.</p>;

  return (
    <div className="view-booking-page">
      <EmptyNavBar />
      <h1 className="page-title">My Bookings</h1>
      <p className="page-subtitle">Manage your hotel reservations</p>
      <div className="bookings-container">
        {bookings.map((booking) => (
          <div
            key={booking.booking_id}
            className="booking-card"
            onClick={() => handleBookingClick(booking)}
          >
            <div className="booking-card-with-image">
              <img
                src={
                  booking.hotelImageUrl || "https://images.unsplash.com/photo-1551776235-dde6d4829808?q=80&w=1200&auto=format&fit=crop"
                }
                alt={booking.hotelName || "Hotel"}
              />
            </div>

            <div className="booking-card-details">
              
              <h2 className="hotel-name">{booking.hotelName}</h2>
              <p className="hotel-address">{booking.hotelAddress}</p>
              <div className="dates-row">
                <div className="date-block">
                  <span className="date-label">Check-in</span>
                  <span className="date-value">
                    {formatDisplayDate(booking.start_date)}
                  </span>
                </div>
                <div className="date-block">
                  <span className="date-label">Check-out</span>
                  <span className="date-value">
                    {formatDisplayDate(booking.end_date)}
                  </span>
                </div>
              </div>

              <p className="guests">
                Guests: {booking.adults} adults
                {booking.children ? `, ${booking.children} children` : ""}
              </p>
              <p className="total-paid">
                Total Paid: ${parseFloat(booking.price).toFixed(2)} SGD
              </p>
            </div>
            
          </div>
        ))}
      </div>
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showModal}
        onClose={closeModal}
      />
    </div>
  );
}
export default ViewBookingsPage;
