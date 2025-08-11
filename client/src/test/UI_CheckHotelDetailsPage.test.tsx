import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import CheckHotelDetailsPage from '../pages/CheckHotelDetailsPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: {
        hotelName: 'Marina Bay Sands',
        hotelAddress: '10 Bayfront Avenue, Singapore',
        roomType: 'Deluxe Room',
        price: '1050.00',
        rates: '350.00',
        checkin: new Date('2025-08-15'),
        checkout: new Date('2025-08-18'),
        noAdults: 2,
        noChildren: 1,
        noRooms: 1,
        roomImage: 'https://example.com/room.jpg'
      }
    })
  };
});


vi.mock('../components/EmptyNavBar', () => ({
  default: () => <div>Navigation Bar</div>
}));

vi.mock('../components/AccountInformation', () => ({
  default: () => <div>Account Information Section</div>
}));

describe('CheckHotelDetailsPage UI Tests', () => {
  
  test('Progress bar is rendered with 4 steps', () => {
    render(
      <BrowserRouter>
        <CheckHotelDetailsPage />
      </BrowserRouter>
    );
    
    // Check all 4 progress steps are visible
    const { container } = render(<CheckHotelDetailsPage />);
    const steps = container.querySelectorAll('.progress-step');
    expect(steps).toHaveLength(4);
  });

  test('Page title is displayed', () => {
    render(
      <BrowserRouter>
        <CheckHotelDetailsPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Booking Information')).toBeInTheDocument();
  });

  test('Hotel information is displayed correctly', () => {
    render(
      <BrowserRouter>
        <CheckHotelDetailsPage />
      </BrowserRouter>
    );
    
    // Check hotel name and address
    expect(screen.getByText('Marina Bay Sands')).toBeInTheDocument();
    expect(screen.getByText('10 Bayfront Avenue, Singapore')).toBeInTheDocument();
    
    // Check room type
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
  });

  test('Room image is displayed when available', () => {
    render(
      <BrowserRouter>
        <CheckHotelDetailsPage />
      </BrowserRouter>
    );
    
    const roomImage = screen.getByRole('img');
    expect(roomImage).toHaveAttribute('src', expect.stringContaining('https://example.com/room.jpg'));
  });

  test('Check-in and Check-out dates are displayed', () => {
    render(
      <BrowserRouter>
        <CheckHotelDetailsPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('15 Aug')).toBeInTheDocument();
    expect(screen.getByText('18 Aug')).toBeInTheDocument();
  });

  test('Guest information section is visible', () => {
    render(
      <BrowserRouter>
        <CheckHotelDetailsPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/2 adults, 1 children/)).toBeInTheDocument();
    expect(screen.getByText(/1 rooms/)).toBeInTheDocument();
    expect(screen.getByText(/350.00 SGD/)).toBeInTheDocument();
  });

  test('Pricing information is displayed', () => {
    render(
      <BrowserRouter>
        <CheckHotelDetailsPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/SGD 1050.00/)).toBeInTheDocument();
    const nightsElements = screen.getAllByText(/3 nights/);
    expect(nightsElements.length).toBeGreaterThan(0); 
  });

  test('Confirm Booking button is rendered', () => {
    render(
      <BrowserRouter>
        <CheckHotelDetailsPage />
      </BrowserRouter>
    );
    
    const confirmButton = screen.getByRole('button', { name: /Confirm Booking/i });
    expect(confirmButton).toBeInTheDocument();
  });
});