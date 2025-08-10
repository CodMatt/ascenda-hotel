import { useState } from "react";
import EmptyNavBar from "../components/EmptyNavBar";
import { fetchHotelDetails } from "../api/hotels";
import "../styles/GuestBookingsPage.css";


type Booking = {
  booking_id: string;
  hotel_id: string;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  price: string | number;
  destination_id: string;
  contact_email?: string;
};

export default function GuestBookingLookupPage() {
  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelAddress, setHotelAddress] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBooking(null);
    setHotelName(null);
    setHotelAddress(null);

    if (!bookingId.trim() || !email.trim()) {
      setError("Please enter both Booking ID and Email.");
      return;
    }

    setLoading(true);
    try {
      // TODO: confirm final endpoint/shape with backend.
      // This is a common pattern:
      // GET /api/booking/lookup?booking_id=...&email=...
      const res = await fetch(
        `/api/booking/lookup?booking_id=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(email)}`
      );

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Unable to find booking. Please check your details.");
      }

      const data: Booking = await res.json();
      setBooking(data);

      // Enrich with hotel details
      try {
        const info = await fetchHotelDetails(data.hotel_id);
        setHotelName(info.name ?? null);
        setHotelAddress(info.address ?? null);
      } catch {
        // Hotel info is optional—don’t block
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <EmptyNavBar />

      <div style={{ maxWidth: 720, margin: "1.5rem auto", width: "100%", padding: "0 1rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>Find your booking</h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
          <label>
            Booking ID
            <input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g. BK-12345"
              className="input"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Looking up…" : "Submit"}
          </button>
        </form>

        {error && (
          <div className="error" role="alert" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {booking && (
          <div className="card" style={{ padding: "1rem", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
              {hotelName ?? "Hotel"} {hotelAddress ? `— ${hotelAddress}` : ""}
            </h2>

            <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 8, columnGap: 12 }}>
              <dt>Booking ID</dt><dd>{booking.booking_id}</dd>
              <dt>Email</dt><dd>{email}</dd>
              <dt>Hotel ID</dt><dd>{booking.hotel_id}</dd>
              <dt>Destination</dt><dd>{booking.destination_id}</dd>
              <dt>Check-in</dt><dd>{new Date(booking.start_date).toLocaleDateString()}</dd>
              <dt>Check-out</dt><dd>{new Date(booking.end_date).toLocaleDateString()}</dd>
              <dt>Guests</dt>
              <dd>{booking.adults} adult(s){booking.children ? `, ${booking.children} child(ren)` : ""}</dd>
              <dt>Total Paid</dt>
              <dd>${Number(booking.price).toFixed(2)} SGD</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
