export type Booking = {
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
  
  const API_BASE = ""; // empty for /api proxy
  
  export async function sendBookingAccess(payload: { booking_id: string; email: string }) {
    const res = await fetch(`${API_BASE}/api/email/send-booking-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to send access email");
    return data as { message?: string; sent?: boolean };
  }
  
  export async function getGuestBookingByToken(token: string) {
    const res = await fetch(`${API_BASE}/api/email/guest-booking/${encodeURIComponent(token)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to load booking");
    return data as { booking: Booking; access_valid_until?: string; message?: string };
  }
  