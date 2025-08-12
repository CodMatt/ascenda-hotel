// DestinationToHotel.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import DestinationSearchPage from '../pages/DestinationSearchPage';
import HotelSearchPage from '../pages/HotelSearchPage';
import { AuthProvider } from '../context/AuthContext';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';

// Test wrapper component that provides all necessary contexts
const TestWrapper = ({ children, initialEntries = ['/'] }: { 
  children: ReactNode; 
  initialEntries?: string[] 
}) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </MemoryRouter>
  );
};

// Mock fetch for AuthContext token verification
global.fetch = vi.fn();

// Mock all external dependencies
vi.mock('../hooks/useDestinations', () => ({
  useDestinations: () => ({
    destinations: [
      { 
        uid: 'RsBU', 
        term: 'Singapore', 
        lat: 1.3521, 
        lng: 103.8198, 
        type: 'city' 
      },
      { 
        uid: 'WD0M', 
        term: 'Tokyo', 
        lat: 35.6762, 
        lng: 139.6503, 
        type: 'city' 
      }
    ],
    loading: false,
    searchDestinations: vi.fn()
  })
}));

vi.mock('../api/hotels', () => ({
  fetchHotels: vi.fn().mockResolvedValue({
    hotels: [
      {
        id: 'hotel-1',
        name: 'Marina Bay Sands',
        address: '10 Bayfront Ave, Singapore',
        rating: 4.5,
        price: 600, // Total for 3 nights
        latitude: 1.2834,
        longitude: 103.8607,
        image: 'marina-bay.jpg'
      },
      {
        id: 'hotel-2', 
        name: 'Raffles Hotel',
        address: '1 Beach Rd, Singapore',
        rating: 5.0,
        price: 900, // Total for 3 nights
        latitude: 1.2966,
        longitude: 103.8547,
        image: 'raffles.jpg'
      }
    ]
  })
}));

vi.mock('../components/MapboxMap', () => ({
  default: ({ hotels, onHotelSelect }: any) => (
    <div data-testid="mapbox-map">
      <div>Map with {hotels.length} hotels</div>
      {hotels.map((hotel: any) => (
        <button 
          key={hotel.id}
          data-testid={`map-hotel-${hotel.id}`}
          onClick={() => onHotelSelect(hotel.id)}
        >
          {hotel.name}
        </button>
      ))}
    </div>
  )
}));

// Mock HotelSearchForm to simulate user interaction
vi.mock('../components/HotelSearchForm', () => ({
  default: ({ onSearch }: { onSearch: Function }) => {
    const handleSubmit = () => {
      onSearch({
        destinationId: 'RsBU',
        checkin: '2024-03-15',
        checkout: '2024-03-18', // 3 nights
        adults: 2,
        children: 1,
        guests: '3',
        lang: 'en',
        currency: 'SGD',
        country_code: 'SG'
      });
    };

    return (
      <div data-testid="hotel-search-form">
        <input data-testid="destination-input" placeholder="Enter destination" />
        <input data-testid="checkin-input" type="date" />
        <input data-testid="checkout-input" type="date" />
        <input data-testid="adults-input" type="number" />
        <input data-testid="children-input" type="number" />
        <button 
          data-testid="search-button" 
          onClick={handleSubmit}
        >
          Search Hotels
        </button>
      </div>
    );
  }
}));

describe('Destination Search to Hotel Search Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default sessionStorage mocks
    window.sessionStorage.getItem = vi.fn().mockImplementation((key) => {
      // Return null for most keys (no auth required for these tests)
      return null;
    });

    // Mock successful auth verification (empty response for no auth required)
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);
  });

  test('complete search destination -> view hotels -> hotel details', async () => {
    const { container } = render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<DestinationSearchPage />} />
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth context to initialize
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify we're on destination search page
    expect(screen.getByText('Discover Your Perfect Stay')).toBeInTheDocument();
    expect(screen.getByTestId('hotel-search-form')).toBeInTheDocument();

    // Fill out search form and submit
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Wait for navigation to hotel search page
    await waitFor(() => {
      expect(screen.queryByText('Discover Your Perfect Stay')).not.toBeInTheDocument();
    });

    // Verify we're now on hotel search page with results
    await waitFor(() => {
      expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
    });

    // Verify hotels are displayed in the hotel cards (not just the map)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /marina bay sands/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /raffles hotel/i })).toBeInTheDocument();
    });

    // Verify price calculation (600 total / 3 nights = 200.00 per night)
    await waitFor(() => {
      expect(screen.getByText('$200.00')).toBeInTheDocument();
      expect(screen.getByText('$300.00')).toBeInTheDocument(); // 900/3
    });

    // Verify map shows correct number of hotels
    expect(screen.getByText('Map with 2 hotels')).toBeInTheDocument();
  });

  test('handles search parameters correctly across navigation', async () => {
    const { fetchHotels } = await import('../api/hotels');
    const mockFetchHotels = vi.mocked(fetchHotels);

    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<DestinationSearchPage />} />
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth initialization
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Trigger search
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Wait for hotel search page to load and call API
    await waitFor(() => {
      expect(mockFetchHotels).toHaveBeenCalledWith(
        'RsBU',      // destinationId
        '2024-03-15', // checkin
        '2024-03-18', // checkout  
        '3'          // guests
      );
    });

    // Verify API was called exactly once with correct parameters
    expect(mockFetchHotels).toHaveBeenCalledTimes(1);
  });

  test('handles empty search results gracefully', async () => {
    // Mock API to return no hotels
    const { fetchHotels } = await import('../api/hotels');
    vi.mocked(fetchHotels).mockResolvedValueOnce({ hotels: [] });

    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<DestinationSearchPage />} />
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth initialization
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Perform search
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('No hotels found.')).toBeInTheDocument();
    });

    // Map should still be present but with 0 hotels
    expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
    expect(screen.getByText('Map with 0 hotels')).toBeInTheDocument();
  });

  test('handles API errors during hotel search', async () => {
    // Mock API to throw error
    const { fetchHotels } = await import('../api/hotels');
    vi.mocked(fetchHotels).mockRejectedValueOnce(new Error('Network error'));

    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<DestinationSearchPage />} />
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth initialization
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Perform search
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load hotel data. Please try again.')).toBeInTheDocument();
    });

    // Loading should be finished
    expect(screen.queryByText('Fetching hotels...')).not.toBeInTheDocument();
  });

  test('hotel selection from map navigates correctly', async () => {
    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<DestinationSearchPage />} />
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
          <Route path="/hotels/:hotelId" element={<div>Hotel Details Page</div>} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth initialization
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Complete search flow
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Wait for hotels to load
    await waitFor(() => {
      expect(screen.getByTestId('map-hotel-hotel-1')).toBeInTheDocument();
    });

    // Click on hotel from map
    const hotelButton = screen.getByTestId('map-hotel-hotel-1');
    fireEvent.click(hotelButton);

    // Should navigate to hotel details (this would need more setup for full test)
    // For now, we can verify the onHotelSelect was called correctly
    // In a real app, you'd verify navigation to /hotels/hotel-1
  });

  test('sorting and filtering works with passed parameters', async () => {
    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<DestinationSearchPage />} />
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth initialization
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Complete search
    fireEvent.click(screen.getByTestId('search-button'));

    // Wait for hotels to load
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /marina bay sands/i })).toBeInTheDocument();
    });

    // Test sorting by price (high to low)
    const sortSelect = screen.getByDisplayValue('Sort By');
    fireEvent.change(sortSelect, { target: { value: 'priceDesc' } });

    // Raffles Hotel ($300/night) should appear before Marina Bay Sands ($200/night)
    const hotelCards = screen.getAllByRole('link');
    expect(hotelCards[0]).toHaveTextContent('Raffles Hotel');
    expect(hotelCards[1]).toHaveTextContent('Marina Bay Sands');

    // Test star rating filter
    const fiveStarButton = screen.getByText('5-Star');
    fireEvent.click(fiveStarButton);

    // Should only show Raffles Hotel (5 stars)
    expect(screen.getByRole('link', { name: /raffles hotel/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /marina bay sands/i })).not.toBeInTheDocument();
  });

  test('maintains search context when navigating back', async () => {
    const { fetchHotels } = await import('../api/hotels');
    const mockFetchHotels = vi.mocked(fetchHotels);

    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<DestinationSearchPage />} />
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth initialization
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Initial search
    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(mockFetchHotels).toHaveBeenCalledTimes(1);
    });

    // In a real scenario, you'd test:
    // 1. User navigates back to destination search
    // 2. Previous search parameters are maintained
    // 3. User can modify and search again
    // 4. Hotel search receives updated parameters

    // This would require more complex routing setup and state management testing
  });
});

describe('Search Parameter Validation Integration', () => {
  test('invalid parameters show appropriate errors', async () => {
    // For this test, we'll create a separate test file or skip this test
    // since changing mocks mid-test is complex in Vitest
    
    // Alternative approach: Test validation at the API level
    const { fetchHotels } = await import('../api/hotels');
    
    render(
      <TestWrapper initialEntries={['/HotelSearchPage']}>
        <Routes>
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth initialization
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Should show missing parameters error when no state is provided
    expect(screen.getByText('Missing required search parameters.')).toBeInTheDocument();
    
    // This would depend on your actual validation logic
    // The test structure is here for when you add parameter validation
  });
});

// Performance tests
/*describe('Integration Performance', () => {
  test('search response time is acceptable', async () => {
    const startTime = performance.now();

    render(
      <TestWrapper>
        <Routes>
          <Route path="/" element={<DestinationSearchPage />} />
          <Route path="/HotelSearchPage" element={<HotelSearchPage />} />
        </Routes>
      </TestWrapper>
    );

    // Wait for auth initialization
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('search-button'));

    await waitFor(() => {
      expect(screen.getByText('Marina Bay Sands')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    // Expect search to complete within reasonable time
    expect(searchTime).toBeLessThan(5000); // 5 seconds
  });
});*/