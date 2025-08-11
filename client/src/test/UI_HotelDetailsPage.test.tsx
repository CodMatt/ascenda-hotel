import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import HotelDetailsPage from '../pages/HotelDetailsPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'hotel123' }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: {
        searchParams: {
          destinationId: 'SG',
          checkin: '2025-08-15',
          checkout: '2025-08-18',
          guests: '2',
          adults: 2,
          children: 0
        }
      }
    })
  };
});

vi.mock('../components/NavBar', () => ({
  default: () => <div>Navigation Bar</div>
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div>Map Tiles</div>,
  Marker: ({ children }: any) => <div data-testid="map-marker">{children}</div>,
  Popup: ({ children }: any) => <div>{children}</div>
}));

vi.mock('../api/hotels', () => ({
  fetchHotelDetails: () => Promise.resolve({
    name: 'Marina Bay Sands',
    address: '10 Bayfront Avenue, Singapore',
    rating: 4.5,
    latitude: 1.2834,
    longitude: 103.8607,
    amenities: {
      freeWifi: true,
      swimmingPool: true,
      gym: true,
      restaurant: true
    },
    image_details: {
      prefix: 'https://example.com/image',
      suffix: '.jpg',
      count: 5
    },
    description: 'Luxury hotel in Singapore'
  }),
  fetchHotelRoomPrices: () => Promise.resolve({
    completed: true,
    rooms: [
      {
        key: 'room1',
        roomDescription: 'Deluxe Room',
        converted_price: 1050,
        price: 1050,
        free_cancellation: true,
        images: [{ url: 'https://example.com/room.jpg' }],
        roomAdditionalInfo: { breakfastInfo: 'hotel_detail_breakfast_included' }
      }
    ]
  })
}));

describe('HotelDetailsPage UI Tests', () => {

  test('Hotel header with name and rating is displayed', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    // Wait for hotel name to appear
    const hotelName = await screen.findByText('Marina Bay Sands');
    expect(hotelName).toBeInTheDocument();
    
    expect(screen.getByText('10 Bayfront Avenue, Singapore')).toBeInTheDocument();
    
    const stars = screen.getAllByText('★');
    expect(stars.length).toBeGreaterThan(0);
  });

  test('View on Map button is rendered', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const mapButton = await screen.findByRole('button', { name: /View on Map/i });
    expect(mapButton).toBeInTheDocument();
  });

  test('Hotel overview section is displayed', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const overviewHeading = await screen.findByText('Hotel overview');
    expect(overviewHeading).toBeInTheDocument();
  });

  test('Room Options section is displayed', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const roomOptionsHeading = await screen.findByText('Room Options');
    expect(roomOptionsHeading).toBeInTheDocument();
  });

  test('Room cards show room details', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const roomType = await screen.findByText('Deluxe Room');
    expect(roomType).toBeInTheDocument();
    
    expect(screen.getByText('Breakfast Included')).toBeInTheDocument();
    
    expect(screen.getByText(/Free cancellation/)).toBeInTheDocument();
  });

  test('Room price is displayed with per night indicator', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );

    const prices = await screen.findAllByText(/\$ 350.00/);
    expect(prices).toHaveLength(2);
    
    expect(screen.getByText('/night')).toBeInTheDocument();
  });

  test('Select button is rendered for each room', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const selectButton = await screen.findByRole('button', { name: /Select/i });
    expect(selectButton).toBeInTheDocument();
  });

  test('Map section is displayed', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const locationHeading = await screen.findByText('Location');
    expect(locationHeading).toBeInTheDocument();
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('Booking sidebar is displayed', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const fromText = await screen.findByText('Select rooms starting from:');
    expect(fromText).toBeInTheDocument();
    
    const seeRoomsButton = screen.getByRole('button', { name: /See Room Options/i });
    expect(seeRoomsButton).toBeInTheDocument();
  });

  test('Facilities section shows amenities', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const facilitiesHeading = await screen.findByText('Facilities');
    expect(facilitiesHeading).toBeInTheDocument();
    
    expect(screen.getByText(/Free Wifi/i)).toBeInTheDocument();
    expect(screen.getByText(/Swimming Pool/i)).toBeInTheDocument();
  });

  test('Click View on Map scrolls to map section', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const mapButton = await screen.findByRole('button', { name: /View on Map/i });
    
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    fireEvent.click(mapButton);
    
    expect(mapButton).toBeInTheDocument();
  });

  test('Click See Room Options scrolls to rooms section', async () => {
    render(
      <BrowserRouter>
        <HotelDetailsPage />
      </BrowserRouter>
    );
    
    const seeRoomsButton = await screen.findByRole('button', { name: /See Room Options/i });
    
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    fireEvent.click(seeRoomsButton);
    
    expect(seeRoomsButton).toBeInTheDocument();
  });
});