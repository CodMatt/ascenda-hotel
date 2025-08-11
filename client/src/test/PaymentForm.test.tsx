// PaymentForm.unit.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaymentForm from '../components/PaymentForm';
import { MemoryRouter } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_12345'); // Use test key

const mockLocationState = {
  state: {
    firstName: 'Jane',
    lastName: 'Doe',
    salutation: 'Ms.',
    phoneNumber: '12345678',
    emailAddress: 'jane@example.com',
    specialRequest: 'Late check-in',
    hotelName: 'Hotel Bliss',
    hotelAddr: '123 Paradise Rd',
    rates: [{ type: 'Deluxe', price: 200 }],
    checkin: new Date('2025-08-15'),
    checkout: new Date('2025-08-17'),
    noAdults: 2,
    noChildren: 1,
    duration: 2,
    totalPrice: 400,
    noRooms: 1,
    destId: 'dest123',
    hotelId: 'hotel456',
    userRef: 'user789',
    roomType: 'Deluxe',
    key: 'bookingKey',
    authToken: 'authToken123'
  }
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocationState,
    useNavigate: () => vi.fn()
  };
});

describe('PaymentForm Unit Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders customer info correctly', async () => {
    render(
      <Elements stripe={stripePromise}>
        <MemoryRouter>
          <PaymentForm />
        </MemoryRouter>
      </Elements>
    );

    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/12345678/)).toBeInTheDocument();
    expect(screen.getByText(/Late check-in/)).toBeInTheDocument();
  });

  it('disables pay button when processing', async () => {
    render(
      <Elements stripe={stripePromise}>
        <MemoryRouter>
          <PaymentForm />
        </MemoryRouter>
      </Elements>
    );

    const button = screen.getByRole('button', { name: /Pay/ });
    expect(button).toBeDisabled(); // initially disabled due to stripe not loaded
  });
  it('should render form with all required fields and labels', () =>{
    render(
    <Elements stripe={null}>
      <MemoryRouter>
        <PaymentForm />
      </MemoryRouter>
    </Elements>
  );

  // Check for headings
  expect(screen.getByRole('heading', { name: /Payment Details/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Enter Payment Information/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Customer Information/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Billing Information/i })).toBeInTheDocument();

  // Check for Stripe elements
  expect(screen.getByRole('button', { name: /Pay \$400 SGD/i })).toBeInTheDocument();


  })
});
