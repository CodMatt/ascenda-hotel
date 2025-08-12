import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PaymentPage from '../pages/PaymentPage';


vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { publishable_key: 'pk_test_123' } })),
    post: vi.fn(() => Promise.resolve({ data: { client_secret: 'pi_test_secret_123' } }))
  }
}));

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    elements: vi.fn(),
    confirmPayment: vi.fn()
  }))
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => <div data-testid="stripe-elements">{children}</div>,
  useStripe: () => ({}),
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
        hotelName: 'Marina Bay Sands',
        hotelAddr: '10 Bayfront Avenue',
        totalPrice: '1050.00',
        rates: '350.00',
        checkin: new Date('2025-08-15'),
        checkout: new Date('2025-08-18'),
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
        phoneNumber: '+65 91234567',
        noRooms: 1,
        noAdults: 2,
        noChildren: 1,
        duration: 3,
        salutation: 'Mr',
        specialRequest: 'Late check-in',
        hotelId: 'hotel123',
        destId: 'SG',
        roomType: 'Deluxe Room',
        key: 'room-key',
        authToken: '',
        userRef: ''
      }
    })
  };
});

vi.mock('../components/EmptyNavBar', () => ({
  default: () => <div data-testid="empty-navbar">Navigation Bar</div>
}));

vi.mock('../components/PaymentForm', () => ({
  default: () => <div data-testid="payment-form">Payment Form Component</div>
}));

vi.mock('react-spinners', () => ({
  ClipLoader: () => <div data-testid="spinner">Loading Spinner</div>
}));

describe('PaymentPage UI Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Navigation bar is displayed', async () => {
    render(
      <BrowserRouter>
        <PaymentPage />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('empty-navbar')).toBeInTheDocument();
  });

  test('Loading state is displayed initially', () => {
    render(
      <BrowserRouter>
        <PaymentPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('Warning message about back button is displayed during loading', () => {
    render(
      <BrowserRouter>
        <PaymentPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Please do not use the back button while we prepare your payment/)).toBeInTheDocument();
  });

  test('Payment form is rendered after loading', async () => {
    render(
      <BrowserRouter>
        <PaymentPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
      expect(screen.getByTestId('payment-form')).toBeInTheDocument();
    });
  });
});