import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PaymentForm from '../components/PaymentForm';

vi.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({
    confirmPayment: vi.fn(() => Promise.resolve({ error: null }))
  }),
  useElements: () => ({}),
  PaymentElement: () => <div data-testid="payment-element">Payment Element</div>,
  AddressElement: () => <div data-testid="address-element">Address Element</div>
}));


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: {
        firstName: 'John',
        lastName: 'Doe',
        salutation: 'Mr',
        phoneNumber: '+65 91234567',
        emailAddress: 'john@example.com',
        specialRequest: 'Late check-in please',
        hotelName: 'Marina Bay Sands',
        hotelAddr: '10 Bayfront Avenue',
        rates: '350.00',
        checkin: new Date('2025-08-15'),
        checkout: new Date('2025-08-18'),
        noAdults: 2,
        noChildren: 1,
        duration: 3,
        totalPrice: '1050.00',
        noRooms: 1,
        destId: 'SG',
        hotelId: 'hotel123',
        userRef: 'user123',
        roomType: 'Deluxe Room',
        key: 'room-key',
        authToken: 'token123'
      }
    })
  };
});

vi.mock('../components/BookingSummary', () => ({
  default: ({ hotelName, totalPrice }: any) => (
    <div data-testid="booking-summary">
      Booking Summary - {hotelName} - ${totalPrice}
    </div>
  )
}));

vi.mock('../components/notifications/CardDeclinedNotification', () => ({
  default: ({ errorMsg }: any) => (
    <div data-testid="card-declined-notification">
      Card Declined: {errorMsg}
    </div>
  )
}));

vi.mock('react-spinners', () => ({
  ClipLoader: () => <div data-testid="spinner">Loading Spinner</div>
}));

describe('PaymentForm UI Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  test('Progress bar is displayed with step 3 active', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    const completedSteps = screen.getAllByText('✓');
    expect(completedSteps).toHaveLength(2);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('Page title is displayed', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Payment Details')).toBeInTheDocument();
  });

  test('Customer information section is displayed', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
    expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('+65 91234567')).toBeInTheDocument();
  });

  test('Special request is displayed when present', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Special Request:')).toBeInTheDocument();
    expect(screen.getByText('Late check-in please')).toBeInTheDocument();
  });

  test('Payment form sections are rendered', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Enter Payment Information')).toBeInTheDocument();
    expect(screen.getByText('Payment Information')).toBeInTheDocument();
    expect(screen.getByText('Billing Information')).toBeInTheDocument();
  });

  test('Stripe payment element is rendered', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
  });

  test('Stripe address element is rendered', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('address-element')).toBeInTheDocument();
  });

  test('Pay button displays correct amount', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    const payButton = screen.getByRole('button', { name: /Pay \$1050.00 SGD/i });
    expect(payButton).toBeInTheDocument();
  });

  test('Booking summary is displayed', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    const bookingSummary = screen.getByTestId('booking-summary');
    expect(bookingSummary).toBeInTheDocument();
    expect(bookingSummary).toHaveTextContent('Marina Bay Sands');
    expect(bookingSummary).toHaveTextContent('$1050.00');
  });

  test('Pay button can be clicked', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    const payButton = screen.getByRole('button', { name: /Pay \$1050.00 SGD/i });
    
    expect(payButton).not.toBeDisabled();
    fireEvent.click(payButton);
  });

  test('Processing state shows loading text', async () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    const form = screen.getByRole('button', { name: /Pay \$1050.00 SGD/i }).closest('form');
    
    if (form) {
      fireEvent.submit(form);
      
      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Processing...');
      }, { timeout: 1000 });
    }
  });

  test('Booking data is stored in sessionStorage', () => {
    render(
      <BrowserRouter>
        <PaymentForm />
      </BrowserRouter>
    );
    
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      'pendingBookingData',
      expect.stringContaining('Marina Bay Sands')
    );
  });
});