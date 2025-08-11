import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EmptyNavBar from "../components/EmptyNavBar";
import { getGuestBookingByToken, type Booking } from "../api/email";
import { fetchHotelDetails } from "../api/hotels";
import formatDisplayDate from "../lib/FormatDisplayDate";

type Enriched = Booking & {
  hotelName?: string | null;
  hotelAddress?: string | null;
  hotelImage?: string | null;
};

function buildHotelImage(info: any, size = 3): string | null {
  if (!info) return null;
  if (info.image) return info.image; // Fallback to direct image URL if available
  const id = info.image_details;
  if (id?.prefix && id?.suffix) return `${id.prefix}${size}${id.suffix}`;
  return null;
}

export default function GuestBookingAccessPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [booking, setBooking] = useState<Enriched | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        setErr("Missing access token.");
        setLoading(false);
        return;
      }
      try {
        const { booking } = await getGuestBookingByToken(token);

        let enriched: Enriched = booking;
        try {
          const info = await fetchHotelDetails(booking.hotel_id);
          enriched = {
            ...booking,
            hotelName: info?.name ?? null,
            hotelAddress: info?.address ?? null,
            hotelImage: buildHotelImage(info, 3), // change to 5 for larger image
          };
        } catch {
        }
        if (active) setBooking(enriched);
      } catch (e: any) {
        if (active) setErr(e.message || "Failed to load booking.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <EmptyNavBar />
      <div style={{ maxWidth: 720, margin: "1.5rem auto", width: "100%", padding: "0 1rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>Your booking</h1>

        {loading && <p>Loading…</p>}
        {err && <p style={{ color: "#dc2626" }}>{err}</p>}

        {booking && (
          <div className="card" style={{ padding: "1rem", borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            {booking.hotelImage && (
              <img
                src={booking.hotelImage}
                alt={booking.hotelName || "Hotel photo"}
                style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12, marginBottom: 12 }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}

            <h2 style={{ margin: 0, marginBottom: ".5rem" }}>
              {booking.hotelName ?? "Hotel"} {booking.hotelAddress ? `— ${booking.hotelAddress}` : ""}
            </h2>

            <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 8, columnGap: 12, margin: 0 }}>
              <dt>Booking ID</dt><dd>{booking.booking_id}</dd>
              <dt>Email</dt><dd>{booking.contact_email ?? "—"}</dd>
              <dt>Hotel ID</dt><dd>{booking.hotel_id}</dd>
              <dt>Destination</dt><dd>{booking.destination_id}</dd>
              <dt>Check-in</dt><dd>{formatDisplayDate(booking.start_date)}</dd>
              <dt>Check-out</dt><dd>{formatDisplayDate(booking.end_date)}</dd>
              <dt>Guests</dt>
              <dd>
                {booking.adults} adult(s){booking.children ? `, ${booking.children} child(ren)` : ""}
              </dd>
              <dt>Total Paid</dt>
              <dd>${Number(booking.price).toFixed(2)} SGD</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
