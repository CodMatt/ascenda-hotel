import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyNavBar from "../components/EmptyNavBar";
import { sendBookingAccess } from "../api/email";
import "../styles/GuestBookingsPage.css";

export default function GuestBookingLookupPage() {
  const navigate = useNavigate();

  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!bookingId.trim() || !email.trim()) {
      setErr("Please enter both Booking ID and Email.");
      return;
    }

    setLoading(true);
    try {
      await sendBookingAccess({ booking_id: bookingId.trim(), email: email.trim() });
      setMsg("Sent secure access link to email provided.");
    } catch (error: any) {
      setErr(error.message || "Could not send email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <EmptyNavBar />

      <div style={{ maxWidth: 720, margin: "1.5rem auto", width: "100%", padding: "0 1rem" }}>
        {/* Title + Back button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h1 style={{ margin: 0 }}>Find your booking</h1>
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/")} 
          >
            Back
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
          <label>
            Booking ID
            <input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g. BK-123456"
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
            {loading ? "Sending…" : "Email me a secure link"}
          </button>
        </form>

        {err && (
          <div className="error" role="alert" style={{ color: "#dc2626" }}>
            {err}
          </div>
        )}
        {msg && (
          <div className="notice" role="status" style={{ color: "#065f46" }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
