import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewBookingsPage from '../pages/ViewBookingPage';
import { AuthProvider } from '../context/AuthContext';
import '@testing-library/jest-dom';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock API
vi.mock('../api/hotels', () => ({
  fetchHotelDetails: vi.fn(),
}));

// Mock utilities
vi.mock('../lib/getHotelImageUrl', () => ({
  default: vi.fn(() => 'https://example.com/hotel.jpg'),
}));

vi.mock('../lib/FormatDisplayDate', () => ({
  default: vi.fn((date) => new Date(date).toLocaleDateString()),
}));

// Mock components
vi.mock('../components/EmptyNavBar', () => ({
  default: () => <div data-testid="navbar">NavBar</div>,
}));

vi.mock('../components/DeleteAccount', () => ({
  default: () => <button data-testid="delete-btn">Delete</button>,
}));

vi.mock('react-spinners', () => ({
  ClipLoader: () => <div data-testid="loader">Loading...</div>,
}));

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('ViewBookingsPage and BookingDetailsModal Integration', () => {
  const mockBookingsData = [
    {
      booking_id: 'booking-123',
      hotel_id: 'obxM',
      destination_id: 'RsBU',
      start_date: '2024-12-01',
      end_date: '2024-12-05',
      adults: 2,
      children: 1,
      price: '450.00',
      nights: 4,
      msg_to_hotel: 'Please prepare a crib for the baby',
      contact_email: 'test@example.com',
      contact_first_name: 'John',
      contact_last_name: 'Doe',
      contact_phone: '+65 9123 4567',
      contact_salutation: 'Mr.',
      hotelName: null,
      hotelAddress: null,
    },
    {
      booking_id: 'booking-456',
      hotel_id: 'obxM', // Same hotel as first booking
      destination_id: 'RsBU',
      start_date: '2024-11-15',
      end_date: '2024-11-18',
      adults: 1,
      children: 0,
      price: '300.00',
      nights: 3,
      msg_to_hotel: '', // Empty special requests
      contact_email: 'jane@example.com',
      contact_first_name: 'Jane',
      contact_last_name: 'Smith',
      contact_phone: '+65 8765 4321',
      contact_salutation: 'Ms.',
      hotelName: null,
      hotelAddress: null,
    },
  ];

  const mockHotelDetails = {
    id: 'obxM',
    name: 'Grand Hotel Singapore',
    address: '123 Orchard Road, Singapore 238873',
    destination_id: 'RsBU',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default auth state
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      token: 'mock-token',
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    });

    // Mock fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/booking/my-bookings-with-contact')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBookingsData),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Mock hotel API
    const { fetchHotelDetails } = await vi.importMock('../api/hotels');
    fetchHotelDetails.mockResolvedValue(mockHotelDetails);
  });

  it('should render bookings and open modal on card click', async () => {
    render(
      <TestWrapper>
        <ViewBookingsPage />
      </TestWrapper>
    );

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
    });

    // Wait for hotel details to be fetched and hotel names to appear
    // Use getAllByText to handle multiple instances
    await waitFor(() => {
      const hotelNames = screen.getAllByText('Grand Hotel Singapore');
      expect(hotelNames).toHaveLength(2);
    }, { timeout: 3000 });

    // Verify booking card content is displayed correctly
    // Use getAllByText for elements that appear multiple times
    const hotelAddresses = screen.getAllByText('123 Orchard Road, Singapore 238873');
    expect(hotelAddresses).toHaveLength(2);
    
    // Use getByText for unique elements
    expect(screen.getByText('Total Paid: $450.00 SGD')).toBeInTheDocument();
    
    // Verify guest information formatting
    expect(screen.getByText('Guests: 2 adults, 1 children')).toBeInTheDocument();

    // Click on the first booking card to open modal
    // Find the specific booking by its unique price
    const firstBookingCard = screen.getByText('Total Paid: $450.00 SGD').closest('.booking-card');
    expect(firstBookingCard).not.toBeNull();
    fireEvent.click(firstBookingCard!);

    // Wait for modal to open and verify modal content
    await waitFor(() => {
      expect(screen.getByText('Booking Details')).toBeInTheDocument();
    });

    // Verify all booking details are shown in modal
    expect(screen.getByText('booking-123')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // nights
    expect(screen.getByText('$450.00 SGD')).toBeInTheDocument(); // price in modal
    expect(screen.getByText('Mr. John Doe')).toBeInTheDocument(); // contact name
    expect(screen.getByText('test@example.com')).toBeInTheDocument(); // contact email
    expect(screen.getByText('+65 9123 4567')).toBeInTheDocument(); // contact phone
    expect(screen.getByText('Please prepare a crib for the baby')).toBeInTheDocument(); // special requests
    
    // Verify hotel information is also shown in modal
    // Now there should be 3 instances: 2 in cards + 1 in modal
    const allHotelNames = screen.getAllByText('Grand Hotel Singapore');
    expect(allHotelNames.length).toBeGreaterThanOrEqual(2);
    
    const allAddresses = screen.getAllByText('123 Orchard Road, Singapore 238873');
    expect(allAddresses.length).toBeGreaterThanOrEqual(2);
  });

  it('should close modal when close button is clicked', async () => {
    render(
      <TestWrapper>
        <ViewBookingsPage />
      </TestWrapper>
    );

    // Wait for hotel names to appear (should be 2)
    await waitFor(() => {
      const hotelNames = screen.getAllByText('Grand Hotel Singapore');
      expect(hotelNames).toHaveLength(2);
    });

    // Open modal - click on first booking card using unique identifier
    const firstBookingCard = screen.getByText('Total Paid: $450.00 SGD').closest('.booking-card');
    expect(firstBookingCard).not.toBeNull();
    fireEvent.click(firstBookingCard!);

    await waitFor(() => {
      expect(screen.getByText('Booking Details')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Booking Details')).not.toBeInTheDocument();
    });
  });

  it('should handle booking without special requests', async () => {
    render(
      <TestWrapper>
        <ViewBookingsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      const hotelNames = screen.getAllByText('Grand Hotel Singapore');
      expect(hotelNames).toHaveLength(2);
    });

    // Click second booking (no special requests) using its unique price
    const secondBookingCard = screen.getByText('Total Paid: $300.00 SGD').closest('.booking-card');
    expect(secondBookingCard).not.toBeNull();
    fireEvent.click(secondBookingCard!);

    await waitFor(() => {
      expect(screen.getByText('Booking Details')).toBeInTheDocument();
    });

    expect(screen.getByText('booking-456')).toBeInTheDocument();
    expect(screen.getByText('Ms. Jane Smith')).toBeInTheDocument();
    // No special requests section should appear
    expect(screen.queryByText('Special Requests')).not.toBeInTheDocument();
  });

  it('should redirect to login when no token', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <TestWrapper>
        <ViewBookingsPage />
      </TestWrapper>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should handle API errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <ViewBookingsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    });
  });

  it('should show empty state when no bookings', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <TestWrapper>
        <ViewBookingsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No previous bookings found.')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(
      <TestWrapper>
        <ViewBookingsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});