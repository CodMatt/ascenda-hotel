import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingSummary from '../components/BookingSummary';

describe('BookingSummary - Bottom-Up Integration Tests', () => {

  const baseBookingDetails = {
    hotelName: "Hotel Paradise",
    hotelAddr: "123 Beach Road",
    rates: 120,
    totalPrice: 500,
    checkin: new Date("2025-08-01"),
    checkout: new Date("2025-08-05"),
    noAdults: 2,
    noChildren: 0,
    noRooms: 1,
  };

  test('IT1: formats check-in date correctly', () => {
    render(<BookingSummary {...baseBookingDetails} />);
    expect(screen.getByText("1 Aug")).toBeInTheDocument();
  });

  test('IT2: formats check-out date correctly', () => {
    render(<BookingSummary {...baseBookingDetails} />);
    expect(screen.getByText("5 Aug")).toBeInTheDocument();
  });

  test('IT3: calculates nights correctly', () => {
    render(<BookingSummary {...baseBookingDetails} />);
    expect(screen.getByText("4 nights")).toBeInTheDocument();
  });

  test('IT4: renders all booking details correctly', () => {
    render(<BookingSummary {...baseBookingDetails} />);
    expect(screen.getByText("Hotel Paradise")).toBeInTheDocument();
    expect(screen.getByText("123 Beach Road")).toBeInTheDocument();
    expect(screen.getByText(/Adults:/)).toHaveTextContent("Adults");
    expect(screen.getByText(/No. Rooms:/).closest(".summary-item")).toHaveTextContent("No. Rooms: 1 rooms");
    expect(screen.getByText("Total: $500 SGD")).toBeInTheDocument();
  });

  test('IT5: renders children field if noChildren > 0', () => {
    render(<BookingSummary {...baseBookingDetails} noChildren={2} />);
    expect(screen.getByText(/Children:/).closest(".summary-item")).toHaveTextContent("Children: 2");
  });

  test('IT6: hides children field if noChildren = 0', () => {
    render(<BookingSummary {...baseBookingDetails} noChildren={0} />);
    expect(screen.queryByText(/Children:/)).toBeNull();
  });

  test('IT7: displays total price correctly', () => {
    render(<BookingSummary {...baseBookingDetails} totalPrice={750} />);
    expect(screen.getByText("Total: $750 SGD")).toBeInTheDocument();
  });

});
