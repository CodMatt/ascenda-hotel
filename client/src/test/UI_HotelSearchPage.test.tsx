// src/test/UI_HotelSearchPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, beforeAll } from 'vitest';
import type { MockedFunction } from 'vitest';

// ---------- Test data ----------
const sampleSearchParams = {
  destinationId: 'SGP.Singapore',
  checkin: '2025-08-15',
  checkout: '2025-08-18', // 3 nights
  guests: '2',
  adults: 2,
  children: 0,
};

const sampleHotels = [
  {
    id: 'H1',
    name: 'Alpha Hotel',
    address: '1 A Road',
    rating: 4.6,
    price: 600, // => $200.00 / night
    latitude: 1.3,
    longitude: 103.8,
    image: 'https://example.com/h1.jpg',
  },
  {
    id: 'H2',
    name: 'Bravo Hotel',
    address: '2 B Road',
    rating: 5.0,
    price: 1200, // => $400.00 / night
    latitude: 1.31,
    longitude: 103.81,
    image: 'https://example.com/h2.jpg',
  },
  {
    id: 'H3',
    name: 'Charlie Hotel',
    address: '3 C Road',
    rating: 3.9,
    price: 300, // => $100.00 / night
    latitude: 1.32,
    longitude: 103.82,
    image: null,
  },
];

// ---------- Initialize mock-controlled vars BEFORE mocks ----------
const navigateMock = vi.fn();
let mockedLocationState: any = { state: { searchParams: sampleSearchParams } };

// ---------- Mocks (top-level, after vars above) ----------
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => mockedLocationState,
  };
});

vi.mock('../components/NavBar', () => ({
  default: () => <div>NavBar</div>,
}));

// Simple Map mock: render buttons to trigger onHotelSelect
vi.mock('../components/MapboxMap', () => ({
  default: ({ hotels, onHotelSelect }: any) => (
    <div>
      <div>Map Mock</div>
      {hotels?.map((h: any) => (
        <button key={h.id} onClick={() => onHotelSelect(h.id)}>
          Select {h.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../api/hotels', () => ({
  fetchHotels: vi.fn(),
}));

// Now import the mocked function & the page *after* mocks
import { fetchHotels } from '../api/hotels';
import HotelSearchPage from '../pages/HotelSearchPage';

// Tell TS it's a mocked function so .mockResolvedValueOnce exists
const mockedFetchHotels = fetchHotels as MockedFunction<typeof fetchHotels>;

// ---------- Polyfills ----------
beforeAll(() => {
  class MockIO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-ignore
  global.IntersectionObserver = MockIO;
});

function renderPage() {
  return render(
    <BrowserRouter>
      <HotelSearchPage />
    </BrowserRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  navigateMock.mockReset();
  mockedLocationState = { state: { searchParams: sampleSearchParams } };
});

// ---------- Tests ----------
describe('HotelSearchPage UI Tests', () => {
  test('Renders NavBar and basic layout', async () => {
    mockedFetchHotels.mockResolvedValueOnce({ hotels: sampleHotels } as any);

    renderPage();

    expect(screen.getByText('NavBar')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // sort dropdown

    expect(await screen.findByText('Alpha Hotel')).toBeInTheDocument();
    expect(screen.getByText('Bravo Hotel')).toBeInTheDocument();
    expect(screen.getByText('Charlie Hotel')).toBeInTheDocument();
  });

  test('Displays computed price per night', async () => {
    mockedFetchHotels.mockResolvedValueOnce({ hotels: sampleHotels } as any);

    renderPage();

    await screen.findByText('Alpha Hotel'); // wait until loaded

    // 3 nights: 600/3=200, 1200/3=400, 300/3=100
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getAllByText(/\/ night$/)).toHaveLength(3);
  });

  test('Sort: Price (high to low) changes order', async () => {
    mockedFetchHotels.mockResolvedValueOnce({ hotels: sampleHotels } as any);

    const { container } = renderPage();
    await screen.findByText('Alpha Hotel');

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'priceDesc' },
    });

    const headings = container.querySelectorAll('.results-grid .hotel-card h3');
    const names = Array.from(headings).map((h) => h.textContent?.trim());
    expect(names).toEqual(['Bravo Hotel', 'Alpha Hotel', 'Charlie Hotel']);
  });

  test('Filter: 5-Star shows only hotels with floor(rating) === 5', async () => {
    mockedFetchHotels.mockResolvedValueOnce({ hotels: sampleHotels } as any);

    renderPage();
    await screen.findByText('Alpha Hotel');

    fireEvent.click(screen.getByRole('button', { name: '5-Star' }));

    expect(screen.getByText('Bravo Hotel')).toBeInTheDocument();
    expect(screen.queryByText('Alpha Hotel')).toBeNull();
    expect(screen.queryByText('Charlie Hotel')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Star' }));
    expect(screen.getByText('Alpha Hotel')).toBeInTheDocument();
    expect(screen.getByText('Charlie Hotel')).toBeInTheDocument();
  });

  test('Clicking a hotel in the map triggers navigation with state', async () => {
    mockedFetchHotels.mockResolvedValueOnce({ hotels: sampleHotels } as any);

    renderPage();
    await screen.findByText('Alpha Hotel');

    fireEvent.click(screen.getByRole('button', { name: 'Select Bravo Hotel' }));

    expect(navigateMock).toHaveBeenCalledWith('/hotels/H2', {
      state: {
        hotelId: 'H2',
        searchParams: sampleSearchParams,
      },
    });
  });

  test('Hotel card links route to the correct details page', async () => {
    mockedFetchHotels.mockResolvedValueOnce({ hotels: sampleHotels } as any);

    renderPage();
    await screen.findByText('Alpha Hotel');

    const alphaLink = screen.getByRole('link', { name: /Alpha Hotel/i });
    const bravoLink = screen.getByRole('link', { name: /Bravo Hotel/i });

    expect(alphaLink).toHaveAttribute('href', expect.stringContaining('/hotels/H1'));
    expect(bravoLink).toHaveAttribute('href', expect.stringContaining('/hotels/H2'));
  });

  test('Shows error message when fetch fails', async () => {
    mockedFetchHotels.mockRejectedValueOnce(new Error('boom') as any);

    renderPage();

    expect(
      await screen.findByText('Failed to load hotel data. Please try again.')
    ).toBeInTheDocument();
  });

  test('Shows missing-params error if location.state.searchParams is absent', async () => {
    mockedLocationState = {}; // no searchParams
    mockedFetchHotels.mockResolvedValueOnce({ hotels: [] } as any); // should not matter

    renderPage();

    expect(
      await screen.findByText('Missing required search parameters.')
    ).toBeInTheDocument();
  });
});
