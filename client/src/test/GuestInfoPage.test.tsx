import { render, screen } from '@testing-library/react';
import GuestInfoPage from '../pages/GuestInfoPage';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      state: {
        hotelId: 'H001',
        destId: 'D001',
        hotelName: 'Hotel Bliss',
        hotelAddr: '123 Paradise Road',
        key: 'abc123',
        rates: 'Standard',
        checkin: new Date('2025-08-15 00:00:00'),
        checkout: new Date('2025-08-20 00:00:00'),
        noAdults: 2,
        noChildren: 1,
        noNights: 5,
        totalPrice: 500,
        noRooms: 1,
        authToken: null,
        userRef: 'U001',
        roomType: 'Deluxe',
        firstName: '',
        lastName: '',
        salutation: '',
        phoneNumber: '',
        emailAddress: '',
        specialRequest: '',
        country: '',
        countryCode: '',
      },
    }),
  };
});

describe('GuestInfoPage', () => {
  it('renders all personal information fields', () => {
    render(
      <MemoryRouter>
        <GuestInfoPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Payment Details/i })).toBeInTheDocument();
    expect(screen.getByText(/Enter Personal Information/i)).toBeDefined();

    expect(screen.getByLabelText(/Salutation/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Salutation \(if others\)/i)).toBeDefined();

    expect(screen.getByLabelText(/First Name/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/First Name/i)).toBeDefined();

    expect(screen.getByLabelText(/Last Name/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeDefined();

    expect(screen.getByLabelText(/Country/i)).toBeDefined();

    expect(screen.getByPlaceholderText(/Code/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Phone Number/i)).toBeDefined();

    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Email Address/i)).toBeDefined();

    expect(screen.getByLabelText(/Special Request/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Special Request/i)).toBeDefined();
  });
});
