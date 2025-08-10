import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import formatDisplayDate from "../lib/FormatDisplayDate";
import EmptyNavBar from "../components/EmptyNavBar";
import { useAuth } from "../context/AuthContext";
import { fetchHotelDetails } from "../api/hotels";

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
  // Add any other fields you want to display
}

function ViewBookingsPage() {
  const { token } = useAuth(); //get token from context
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
              return {
                ...booking,
                hotelName: hotelData.name,
                hotelAddress: hotelData.address,
              };
            } catch (error) {
              console.warn(
                `Failed to fetch hotel details for ${booking.hotel_id}:`,
                error
              );
              return {
                ...booking,
                hotelName: undefined,
                hotelAddress: undefined,
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

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p>Error: {error}</p>;
  if (bookings.length === 0) return <p>No previous bookings found.</p>;

  return (
    <div  style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <EmptyNavBar />
      <h1>My Bookings</h1>
      <div
        style={{
        flex: 1, // take remaining space
        overflowY: "auto",
        padding: "1rem",
      }}>
        <ul>
          {bookings.map((booking) => (
            <li
              key={booking.booking_id}
              style={{ marginBottom: "1rem", cursor: "pointer" }}
              onClick={() => navigate(`/booking-details/${booking.booking_id}`)} // Assume you have a route for booking details
            >
              <strong>{booking.hotelName}</strong>
              <br />
              Address: {booking.hotelAddress}
              <br />
              Check-in: {formatDisplayDate(booking.start_date)}
              <br />
              Check-out: {formatDisplayDate(booking.end_date)}
              <br />
              Guests: {booking.adults} adults
              {booking.children ? `, ${booking.children} children` : ""}
              <br />
              Total Paid: ${parseFloat(booking.price).toFixed(2)} SGD
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ViewBookingsPage;
