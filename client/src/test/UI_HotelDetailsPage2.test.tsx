
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import HotelDetailsPage from "../pages/HotelDetailsPage";

vi.mock("../api/hotels", () => ({
  fetchHotelDetails: vi.fn(),
  fetchHotelRoomPrices: vi.fn(),
}));

vi.mock("react-leaflet", () => {
  return {
    MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
    TileLayer: () => null,
    Marker: () => null,
    Popup: ({ children }: any) => <div>{children}</div>,
  };
});

vi.mock("../components/NavBar", () => ({
  default: () => <div data-testid="navbar" />,
}));

import { fetchHotelDetails, fetchHotelRoomPrices } from "../api/hotels";

function renderWithRouter(initialPath = "/hotel/123") {
  return render(
    <AuthProvider>
      <MemoryRouter
        initialEntries={[
          {
            pathname: initialPath,
            state: {
              searchParams: {
                destinationId: "WD0M",
                checkin: "2025-10-11",
                checkout: "2025-10-13",
                guests: "2",
                adults: 2,
                children: 0,
              },
            },
          },
        ]}
      >
        <Routes>
          <Route path="/hotel/:id" element={<HotelDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("HotelDetailsPage render flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loader, then displays hotel info and lowest nightly price with facilities", async () => {
    const mockFetchHotelDetails = vi.fn().mockResolvedValue({
      name: "Test Hotel",
      address: "123 Test Street",
      rating: 4.2,
      latitude: 1.3,
      longitude: 103.8,
      amenities: {
        wifi: true,
        pool: true,
        parking: false,
      },
      description: "In Singapore. Make yourself at home.",
    });

    const mockFetchHotelRoomPrices = vi.fn().mockResolvedValue({
      completed: false,
      rooms: [
        {
          key: "r1",
          price: 0,
          converted_price: 200,
          images: [],
          roomDescription: "Deluxe Room",
          free_cancellation: true,
        },
        {
          key: "r2",
          converted_price: 300,
          images: [],
          roomDescription: "Deluxe Room",
          free_cancellation: false,
        },
      ],
    });

    (fetchHotelDetails as Mock).mockImplementation(mockFetchHotelDetails);
    (fetchHotelRoomPrices as Mock).mockImplementation(mockFetchHotelRoomPrices);

    renderWithRouter();

    expect(screen.getByText(/Fetching hotels/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetchHotelDetails).toHaveBeenCalledWith("123");
      expect(mockFetchHotelRoomPrices).toHaveBeenCalledWith("123", "WD0M", "2025-10-11", "2025-10-13", "2");
    });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /test hotel/i })
      ).toBeInTheDocument()
    );
    expect(screen.getByText(/123 Test Street/i)).toBeInTheDocument();

    expect(screen.getByText("/ night")).toBeInTheDocument();

    expect(screen.getByText("Wifi")).toBeInTheDocument();
    expect(screen.getByText("Pool")).toBeInTheDocument();

    expect(screen.getByTestId("map")).toBeInTheDocument();
  });
});
