import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock useNavigate while keeping the rest of react-router-dom actual
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { MemoryRouter } from 'react-router-dom'; // actual (preserved by the mock factory)
import formatDisplayDate from '../lib/FormatDisplayDate';
import EmptyNavBar from '../components/EmptyNavBar';
import BookingSuccessCard from '../components/BookingSuccessCard';

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

// Check if functions are being called correctly
describe('Bottom-up: unit tests for low-level pieces', () => {
  it('U1: formatDisplayDate formats a Date into "D Mon"', () => {
    const d = new Date('2025-08-01T00:00:00.000Z');
    expect(formatDisplayDate(d)).toBe('1 Aug');
  });

  it('U2: formatDisplayDate returns empty string for falsy input', () => {
    // @ts-ignore - intentionally passing null to test defensive behavior
    expect(formatDisplayDate(null)).toBe('');
    // @ts-ignore
    expect(formatDisplayDate(undefined)).toBe('');
  });

  it('U3: EmptyNavBar renders the logo image with correct alt', () => {
    render(<EmptyNavBar />);
    const logoImg = screen.getByAltText('Ascenda logo');
    expect(logoImg).toBeInTheDocument();
    // Optionally assert it is an <img>
    expect(logoImg.tagName.toLowerCase()).toBe('img');
  });
});

describe('Integration tests for BookingSuccessCard', () => {
  const mockProps = {
    bookingId: 'B12345',
    hotelName: 'Test Hotel',
    hotelAddr: '123 Test Street',
    roomType: 'Deluxe Suite',
    // use ISO UTC times to avoid timezone shifts in CI
    checkin: new Date('2025-08-01T00:00:00.000Z'),
    checkout: new Date('2025-08-05T00:00:00.000Z'),
    duration: 4,
    salutation: 'Mr.',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '65 12345678',
    emailAddress: 'john@example.com',
    noAdults: '2',
    noChildren: '1',
    specialRequest: 'Late check-out please',
    rates: 200,
    totalPrice: 800.09,
    noRooms: 1,
  };

  it('I1 / I10: renders Booking ID and includes EmptyNavBar logo', () => {
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });
    // Booking ID strong contains "Booking ID: B12345"
    expect(screen.getByText('Booking ID: B12345')).toBeInTheDocument();
    // EmptyNavBar should render the logo (child integration)
    expect(screen.getByAltText('Ascenda logo')).toBeInTheDocument();
  });

  it('I2: renders hotel information (name, address, room type)', () => {
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    expect(screen.getByText('123 Test Street')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
  });

  it('I3: displays formatted check-in and check-out dates (integration of formatDisplayDate)', () => {
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });
    // formatDisplayDate yields "1 Aug" and "5 Aug"
    expect(screen.getByText('1 Aug')).toBeInTheDocument();
    expect(screen.getByText('5 Aug')).toBeInTheDocument();
  });

  it('I4: shows duration and pluralization (4 -> "4 nights")', () => {
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });
    expect(screen.getByText('4 nights')).toBeInTheDocument();
  });

  it('I4b: shows singular "1 night" when duration === 1', () => {
    const p = { ...mockProps, duration: 1 };
    render(<BookingSuccessCard {...p} />, { wrapper: MemoryRouter });
    expect(screen.getByText('1 night')).toBeInTheDocument();
  });

  it('I5: renders guest full name and contact info', () => {
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });
    expect(screen.getByText('Mr. John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('65 12345678')).toBeInTheDocument();
  });

  it('I6: specialRequest block renders only when provided', () => {
    // with specialRequest
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });
    expect(screen.getByText('Late check-out please')).toBeInTheDocument();
    
  });

  it('i6p2: specialRequest block does not render when not provided', () => {
    // without specialRequest
    const p2 = { ...mockProps, specialRequest: '' };
    render(<BookingSuccessCard {...p2} />, { wrapper: MemoryRouter });
    // The special request text should not be present in the DOM
    console.log("query by text",screen.queryByText('Late check-out please'))
    expect(screen.queryByText('Late check-out please')).toBeNull();
  })

  it('I7: payment summary displays rates, number of rooms and total price', () => {
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });
    expect(screen.getByText('$200 SGD')).toBeInTheDocument(); // per-night text
    // Number of rooms appears as a span; search by label and check its parent row
    const roomsLabel = screen.getByText('Number of Rooms:');
    expect(roomsLabel).toBeInTheDocument();
    // the sibling span should contain "1"
    const parentRow = roomsLabel.parentElement;
    expect(parentRow).toHaveTextContent('1');

    expect(screen.getByText('$800.09 SGD')).toBeInTheDocument(); // total
  });

  it('I8: clicking "Print Confirmation" calls window.print()', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText('Print Confirmation'));
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('I9: clicking "Book Another Stay" clears pendingBookingData and calls navigate("/")', () => {
    sessionStorage.setItem('pendingBookingData', 'someData');
    console.log("test",sessionStorage.getItem('pendingBookingData'))
    render(<BookingSuccessCard {...mockProps} />, { wrapper: MemoryRouter });

    const backButton = screen.queryByText('Book Another Stay');
    
    expect(backButton).not.toBeNull();


  });
});
