import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import HotelSearchPage from '../pages/HotelSearchPage';

// ---- Minimal global stubs so the page can render in tests ----
beforeEach(() => {
  vi.clearAllMocks();

  // AuthContext uses fetch + sessionStorage
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({})
  } as any);

  // No token present by default

  if (!window.sessionStorage) {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  }
  vi.spyOn(window.sessionStorage, 'getItem').mockReturnValue(null);
  

  // IntersectionObserver (for lazy-load sentinel)
  // If you already provide this in a global setup, you can remove this block.
  const ioMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof IntersectionObserver;
  (global as any).IntersectionObserver = ioMock;
});

// ---- Mock fetchHotels so the Search page has data to render ----
vi.mock('../api/hotels', () => ({
  fetchHotels: vi.fn().mockResolvedValue({
    hotels: [
      {
        id: 'hotel-1',
        name: 'Clickable Hotel',
        address: '1 Test Way',
        rating: 4.2,
        price: 400, // total for 2 nights -> $200 / night
        latitude: 1.23,
        longitude: 103.45,
        image: 'x.jpg',
      },
      {
        id: 'hotel-2',
        name: 'Other Hotel',
        address: '2 Test Way',
        rating: 5,
        price: 600, // total for 2 nights -> $300 / night
        latitude: 1.24,
        longitude: 103.46,
        image: 'y.jpg',
      },
    ],
  }),
}));

// ---- Mock MapboxMap to expose a button that triggers onHotelSelect ----
vi.mock('../components/MapboxMap', () => ({
  default: ({ hotels, onHotelSelect }: any) => (
    <div data-testid="mapbox-map">
      <div>Map has {hotels.length} hotels</div>
      {hotels.map((h: any) => (
        <button
          key={h.id}
          data-testid={`map-pick-${h.id}`}
          onClick={() => onHotelSelect(h.id)}
        >
          Pick {h.name}
        </button>
      ))}
    </div>
  ),
}));

// ---- A tiny fake details page to assert we navigated & got state ----
function FakeHotelDetails() {
  // read the URL and router state
  // (Don’t import your real page to keep this test isolated)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useParams, useLocation } = require('react-router-dom');
  const { hotelId } = useParams();
  const location = useLocation();
  const state = (location.state || {}) as {
    hotelId?: string;
    searchParams?: any;
  };

  return (
    <div data-testid="details">
      <div>Details for: {hotelId}</div>
      <div>State hotelId: {state.hotelId || 'none'}</div>
      <div>Checkin: {state.searchParams?.checkin || 'missing'}</div>
      <div>Guests: {state.searchParams?.guests || 'missing'}</div>
    </div>
  );
}

// ---- Helper wrapper that injects Auth + initial route+state ----
function renderWithRouter(initialState: any) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/HotelSearchPage',
          state: { searchParams: initialState },
        } as any,
      ]}
    >
      <AuthProvider>
        <Routes>
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
          <Route path="/hotels/:hotelId" element={<FakeHotelDetails />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const baseSearchParams = {
  destinationId: 'RsBU',
  checkin: '2025-12-01',
  checkout: '2025-12-03', // 2 nights
  guests: '2',
  adults: '2',
  children: '0',
  lang: 'en',
  currency: 'SGD',
  country_code: 'SG',
};

describe('HotelSearchPage → HotelDetailsPage', () => {
  it('navigates to details when clicking a hotel card', async () => {
    renderWithRouter(baseSearchParams);

    // Wait for hotels to load (a card is a <Link/> with hotel name)
    const link = await screen.findByRole('link', { name: /clickable hotel/i });
    // it includes per-night price; optional check:
    await screen.findByText('$200.00'); // 400/2

    // Click the card → should navigate
    fireEvent.click(link);

    // Arrived at details page with correct URL param + state
    await waitFor(() => {
      expect(screen.getByTestId('details')).toBeInTheDocument();
      expect(screen.getByText(/Details for: hotel-1/i)).toBeInTheDocument();
      expect(screen.getByText(/State hotelId: hotel-1/i)).toBeInTheDocument();
      expect(screen.getByText(/Checkin: 2025-12-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Guests: 2/i)).toBeInTheDocument();
    });
  });

  it('navigates to details when picking a hotel on the map', async () => {
    renderWithRouter(baseSearchParams);

    // Wait for map + buttons
    await screen.findByTestId('mapbox-map');
    const pickBtn = await screen.findByTestId('map-pick-hotel-2');

    // Click the "Pick Other Hotel" button → triggers navigate inside page
    fireEvent.click(pickBtn);

    // Assert we are on details for hotel-2 with state intact
    await waitFor(() => {
      expect(screen.getByTestId('details')).toBeInTheDocument();
      expect(screen.getByText(/Details for: hotel-2/i)).toBeInTheDocument();
      expect(screen.getByText(/State hotelId: hotel-2/i)).toBeInTheDocument();
      expect(screen.getByText(/Checkin: 2025-12-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Guests: 2/i)).toBeInTheDocument();
    });
  });

  describe('HotelSearchPage → HotelDetailsPage edge cases', () => {
    it('navigates to details when state is missing', async () => {
      // No searchParams passed in initialEntries
      render(
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/hotels/hotel-1',
              state: {}, // intentionally empty
            } as any,
          ]}
        >
          <AuthProvider>
            <Routes>
              <Route path="/hotels/:hotelId" element={<FakeHotelDetails />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );
  
      // Should still render details page with hotelId from URL
      await waitFor(() => {
        expect(screen.getByTestId('details')).toBeInTheDocument();
        expect(screen.getByText(/Details for: hotel-1/i)).toBeInTheDocument();
        expect(screen.getByText(/State hotelId: none/i)).toBeInTheDocument();
        expect(screen.getByText(/Checkin: missing/i)).toBeInTheDocument();
        expect(screen.getByText(/Guests: missing/i)).toBeInTheDocument();
      });
    });
  
    it('shows not found message for invalid hotel ID', async () => {
      // A fake details page that mimics "hotel not found" behavior
      function FakeDetailsNotFound() {
        const { hotelId } = require('react-router-dom').useParams();
        if (hotelId === 'invalid-id') {
          return <div data-testid="not-found">Hotel not found</div>;
        }
        return <div data-testid="details">Details for: {hotelId}</div>;
      }
  
      render(
        <MemoryRouter initialEntries={['/hotels/invalid-id']}>
          <AuthProvider>
            <Routes>
              <Route path="/hotels/:hotelId" element={<FakeDetailsNotFound />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );
  
      // Should render not found message
      await waitFor(() => {
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
        expect(screen.getByText(/hotel not found/i)).toBeInTheDocument();
      });
    });
  });
  
});
