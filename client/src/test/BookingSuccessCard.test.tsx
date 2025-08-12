import { render, screen, fireEvent, within } from '@testing-library/react';
import BookingSuccessCard from '../components/BookingSuccessCard';
import { describe, it, expect, vi} from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../lib/FormatDisplayDate', () => ({
  default: (date: string | Date) => typeof date === 'string' ? date : date.toISOString().split('T')[0],
}));

describe('BookingSuccessCard', () => {
  const mockProps = {
    bookingId: 'ABC123',
    hotelName: 'Test Hotel',
    hotelAddr: '123 Test Street',
    roomType: 'Deluxe',
    checkin: new Date('2025-08-15'),
    checkout: new Date('2025-08-20'),
    duration: 5,
    salutation: 'Ms',
    firstName: 'Faustina',
    lastName: 'Tan',
    phoneNumber: '91234567',
    emailAddress: 'faustina@example.com',
    noAdults: '2',
    noChildren: '1',
    specialRequest: 'Late check-in',
    rates: 100,
    totalPrice: 500,
    noRooms: 1,
  };

  it('renders all booking details correctly', () => {
    render(
      <MemoryRouter>
        <BookingSuccessCard {...mockProps} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Booking Confirmed!/i)).toBeInTheDocument();
    expect(screen.getByText(/Booking ID: ABC123/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Hotel/i)).toBeInTheDocument();
    expect(screen.getByText(/123 Test Street/i)).toBeInTheDocument();
    expect(screen.getByText(/Deluxe/i)).toBeInTheDocument();
    expect(screen.getByText(/2025-08-15/i)).toBeInTheDocument();
    expect(screen.getByText(/2025-08-20/i)).toBeInTheDocument();
    expect(screen.getAllByText(/5 nights/i).forEach(el =>{
        expect(el).toBeInTheDocument();
    }))
    expect(screen.getByText(/Ms Faustina Tan/i)).toBeInTheDocument();
    expect(screen.getByText(/faustina@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/91234567/i)).toBeInTheDocument();
    expect(screen.getByText(/Late check-in/i)).toBeInTheDocument();
    expect(screen.getByText(/\$500 SGD/i)).toBeInTheDocument();
  });

  it('calls window.print when clicking Print Confirmation', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <BookingSuccessCard {...mockProps} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Print Confirmation/i }));
    expect(printSpy).toHaveBeenCalled();
  });

  
});
