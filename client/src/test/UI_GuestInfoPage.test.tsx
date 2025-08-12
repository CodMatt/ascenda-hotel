import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import GuestInfoPage from '../pages/GuestInfoPage';

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
        noAdults: 2,
        noChildren: 1,
        noRooms: 1,
        authToken: '' // Testing non-authenticated user
      }
    })
  };
});

vi.mock('../components/EmptyNavBar', () => ({
  default: () => <div>Navigation Bar</div>
}));

vi.mock('../components/BookingSummary', () => ({
  default: () => <div>Booking Summary Panel</div>
}));

describe('GuestInfoPage UI Tests', () => {

  test('Page title and progress bar are displayed', () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    // Check title
    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    
    // Check progress bar shows step 2 is active
    expect(screen.getByText('✓')).toBeInTheDocument(); // Step 1 completed
    expect(screen.getByText('2')).toBeInTheDocument();  // Step 2 active
    expect(screen.getByText('3')).toBeInTheDocument();  // Step 3
    expect(screen.getByText('4')).toBeInTheDocument();  // Step 4
  });

  test('Form section header is visible', () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Enter Personal Information')).toBeInTheDocument();
  });

  test('All form fields are rendered for guest users', () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    // Check all input fields are present
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Special Request/)).toBeInTheDocument();
  });

  test('Salutation dropdown has correct options', () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    const salutationSelect = screen.getAllByRole('combobox')[0];
    fireEvent.click(salutationSelect);
    
    // Check options are available
    expect(screen.getByRole('option', { name: 'Mr' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mrs' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ms' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Miss' })).toBeInTheDocument();
  });

  test('Country dropdown is rendered', () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(1); // Should have multiple dropdowns
  });

  test('Special request textarea has character limit indicator', () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    const specialRequest = screen.getByPlaceholderText(/Special Request/);
    expect(specialRequest).toHaveAttribute('maxLength', '150');
  });

  test('Submit and back buttons are visible', () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button', { name: /Proceed to Payment/i })).toBeInTheDocument();
  });

  test('Booking summary panel is displayed', () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Booking Summary Panel')).toBeInTheDocument();
  });

  test('Form inputs accept user input', async () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    const firstNameInput = screen.getByPlaceholderText('First Name');
    const lastNameInput = screen.getByPlaceholderText('Last Name');
    
    // Type in the inputs
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    
    // Check values are displayed
    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
  });

  test('Email input accepts email format', async () => {
    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('Email Address');
    await userEvent.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });
});