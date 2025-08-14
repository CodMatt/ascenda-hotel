
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { AuthContext } from "../context/AuthContext";

import CheckHotelDetailsPage from "../pages/CheckHotelDetailsPage";
import GuestInfoPage from "../pages/GuestInfoPage";

// mock AuthContext
const mockAuthValue = {
  user: null,
  token: "",
  loading: false,
  signup: vi.fn().mockResolvedValue({ ok: true }),
  login: vi.fn(),
  logout: vi.fn(),
};


describe("CheckHotelDetailsPage to GuestInfoPage navigation", () => {
  it("passes booking state correctly via navigate", async () => {
    // Prepare a mock booking state
    const bookingState = {
      id: "hotel1",
      destId: "dest1",
      hotelName: "Test Hotel",
      hotelAddress: "123 Test St",
      key: "abc123",
      price: 500,
      rates: 100,
      checkin: new Date("2025-08-20"),
      checkout: new Date("2025-08-22"),
      noAdults: 2,
      noChildren: 1,
      roomType: "Deluxe",
      noRooms: 1,
      roomImage: "room.jpg",
    };


    render(
      <MemoryRouter initialEntries={[{ pathname: "/check", state: bookingState }]}>
        <AuthContext.Provider value={mockAuthValue}>
          <Routes>
            <Route path="/check" element={<CheckHotelDetailsPage />} />
            <Route path="/guestinfo" element={<GuestInfoPage />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Click Confirm Booking to navigate
    await userEvent.click(screen.getByRole("button", { name: /Confirm Booking/i }));

    // Check whether correct info is received (whatever is displayed) through BookingSummary
    expect(await screen.findByText(/Test Hotel/)).toBeInTheDocument();
    expect(await screen.findByText(/123 Test St/)).toBeInTheDocument();
    expect(await screen.findByText(/Total: \$500 SGD/i)).toBeInTheDocument();

    expect(screen.getByTestId("noChildren")).toHaveTextContent("Children: 1");
    expect(screen.getByTestId("noAdults")).toHaveTextContent("Adults: 2");
    expect(screen.getByTestId("checkin")).toHaveTextContent("20 Aug");
    expect(screen.getByTestId("checkout")).toHaveTextContent("22 Aug");
    
  });
});