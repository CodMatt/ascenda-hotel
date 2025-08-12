import { render, screen, fireEvent } from "@testing-library/react";
import BookingDetailsModal from "../components/BookingDetailsModal";
import { describe, it, expect, vi } from "vitest";

const mockBooking = {
  booking_id: "abc123",
  hotel_id: "obxM",
  destination_id: "RsBU",
  start_date: "2025-09-01",
  end_date: "2025-09-05",
  nights: 4,
  adults: 2,
  children: 0,
  price: "850.00",
  msg_to_hotel: "Please prepare a vegan breakfast.",
  contact_email: "jane.doe@example.com",
  contact_first_name: "Jane",
  contact_last_name: "Doe",
  contact_phone: "+65 8123 4567",
  contact_salutation: "Ms",
  hotelName: "Ascenda Grand Marina",
  hotelAddress: "88 Ocean Drive, Singapore",
};

describe("BookingDetailsModal", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <BookingDetailsModal booking={mockBooking} isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("does not render when booking is null", () => {
    const { container } = render(
      <BookingDetailsModal booking={null} isOpen={true} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders booking details when open", () => {
    render(
      <BookingDetailsModal booking={mockBooking} isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText(/Booking Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Ascenda Grand Marina/i)).toBeInTheDocument();
    expect(screen.getByText(/Please prepare a vegan breakfast/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
  });

  it("calls onClose when clicking outside modal", () => {
    const onClose = vi.fn();
    render(<BookingDetailsModal booking={mockBooking} isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByText(/Booking Details/i).parentElement!.parentElement!);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking × button", () => {
    const onClose = vi.fn();
    render(<BookingDetailsModal booking={mockBooking} isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalled();
  });
});
