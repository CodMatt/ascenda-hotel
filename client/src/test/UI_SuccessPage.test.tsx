import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import SuccessPage from '../pages/SuccessPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

vi.mock('../components/EmptyNavBar', () => ({
  default: () => <div>Navigation Bar</div>
}));

vi.mock('../lib/FormatDisplayDate', () => ({
  default: (date: any) => {
    if (typeof date === 'string') return date;
    return '15 Aug 2025';
  }
}));

describe('SuccessPage UI Tests', () => {
  
  beforeEach(() => {
    const bookingData = {
      hotelName: 'Marina Bay Sands',
      hotelAddr: '10 Bayfront Avenue',
      roomType: 'Deluxe Room',
      checkin: '2025-08-15',
      checkout: '2025-08-18',
      duration: 3,
      salutation: 'Mr',
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john@example.com',
      phoneNumber: '+65 91234567',
      totalPrice: '1050.00',
      rates: '350.00',
      noRooms: 1,
      noAdults: 2,
      noChildren: 1,
      specialRequest: 'Late check-in please',
      userRef: 'user123',
      destId: 'SG',
      hotelId: 'hotel123'
    };
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'pendingBookingData') {
            return JSON.stringify(bookingData);
          }
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ booking_id: 'BOOK-2025-001' })
      } as Response)
    );

    window.print = vi.fn();
  });

  test('Loading spinner is displayed initially', () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Saving to database')).toBeInTheDocument();
  });

  test('Progress bar shows all 4 steps completed', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
    });
    
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(4);
  });

  test('Booking confirmation heading and message are displayed', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('Thank you for your booking!')).toBeInTheDocument();
      expect(screen.getByText(/Your reservation has been confirmed/)).toBeInTheDocument();
    });
  });

  test('Booking ID is displayed', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Booking ID: BOOK-2025-001/)).toBeInTheDocument();
    });
  });

  test('Hotel information section is displayed', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Hotel Information')).toBeInTheDocument();
      
      expect(screen.getByText('Marina Bay Sands')).toBeInTheDocument();
      expect(screen.getByText('10 Bayfront Avenue')).toBeInTheDocument();
      expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    });
  });

  test('Stay duration of nights is displayed', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Stay Information')).toBeInTheDocument();
      expect(screen.getByText('Duration:')).toBeInTheDocument();
      
      expect(screen.getByText('3 nights')).toBeInTheDocument();
    });
  });

  test('Guest information section is displayed', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Guest Information')).toBeInTheDocument();
      
      expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+65 91234567')).toBeInTheDocument();
      
    });
  });

  test('Special requests section is displayed when present', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Special Requests')).toBeInTheDocument();
      expect(screen.getByText('Late check-in please')).toBeInTheDocument();
    });
  });

  test('Payment summary section is displayed', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Payment Summary')).toBeInTheDocument();
      
      expect(screen.getByText(/Per Night \(3 nights\):/)).toBeInTheDocument();
      expect(screen.getByText('$350.00 SGD')).toBeInTheDocument();
      
      expect(screen.getByText('Number of Rooms:')).toBeInTheDocument();
      
      expect(screen.getByText('Total Paid:')).toBeInTheDocument();
      expect(screen.getByText('$1050.00 SGD')).toBeInTheDocument();
    });
  });

  test('Action buttons are displayed', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      const printButton = screen.getByRole('button', { name: /Print Confirmation/i });
      const bookAnotherButton = screen.getByRole('button', { name: /Book Another Stay/i });
      
      expect(printButton).toBeInTheDocument();
      expect(bookAnotherButton).toBeInTheDocument();
    });
  });

  test('Print button triggers window.print', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      const printButton = screen.getByRole('button', { name: /Print Confirmation/i });
      fireEvent.click(printButton);
      
      expect(window.print).toHaveBeenCalled();
    });
  });

  test('Book Another Stay button clears session storage', async () => {
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      const bookAnotherButton = screen.getByRole('button', { name: /Book Another Stay/i });
      fireEvent.click(bookAnotherButton);
      
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('pendingBookingData');
    });
  });


  test('Failure page when booking save fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Database error' })
      } as Response)
    );
    
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Payment Failed')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/We're sorry, your payment could not be processed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Over/i })).toBeInTheDocument();
  });

  test('Progress bar shows failed state on error', async () => {
    // Mock failed API response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Database error' })
      } as Response)
    );
    
    render(
      <BrowserRouter>
        <SuccessPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('✗')).toBeInTheDocument();
    });
  });
});