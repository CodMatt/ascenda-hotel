import { render, screen } from "@testing-library/react";
import ViewBookingsPage from "../pages/ViewBookingPage";
import { describe, it, expect, vi } from "vitest";
import { AuthContext } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";

const mockBooking = [
  {
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
    hotelImageUrl: "https://cdn.ascenda.com/hotels/obxM.jpg",
  },
];

vi.mock("../api/hotels", () => ({
  fetchHotelDetails: vi.fn(() =>
    Promise.resolve({
      name: "Ascenda Grand Marina",
      address: "88 Ocean Drive, Singapore",
    })
  ),
}));

vi.mock("../lib/getHotelImageUrl", () => ({
  default: () => "https://cdn.ascenda.com/hotels/obxM.jpg",
}));

describe("ViewBookingsPage", () => {
  it("shows loading spinner initially", () => {
    global.fetch = vi.fn(() =>
      new Promise(() => {}) // never resolves
    ) as any;

    render(
      <AuthContext.Provider
        value={{
          user: null,
          token: "mock-token",
          loading: false,
          login: vi.fn(),
          signup: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <ViewBookingsPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Loading your booking/i)).toBeInTheDocument();
  });

  it("shows error message when fetch fails", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve("Unauthorized"),
      })
    ) as any;

    render(
      <AuthContext.Provider
        value={{
          user: null,
          token: "mock-token",
          loading: false,
          login: vi.fn(),
          signup: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <ViewBookingsPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const errorMessage = await screen.findByText(/Error:/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("shows no bookings message when list is empty", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as any;

    render(
      <AuthContext.Provider
        value={{
          user: null,
          token: "mock-token",
          loading: false,
          login: vi.fn(),
          signup: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <ViewBookingsPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const noBookingsMsg = await screen.findByText(/No previous bookings found/i);
    expect(noBookingsMsg).toBeInTheDocument();
  });

  it("renders booking cards when data is available", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBooking),
      })
    ) as any;

    render(
      <AuthContext.Provider
        value={{
          user: null,
          token: "mock-token",
          loading: false,
          login: vi.fn(),
          signup: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <ViewBookingsPage />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const hotelName = await screen.findByText(/Ascenda Grand Marina/i);
    expect(hotelName).toBeInTheDocument();
  });
});
