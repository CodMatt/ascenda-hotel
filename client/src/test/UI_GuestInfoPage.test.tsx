import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import GuestInfoPage from '../pages/GuestInfoPage';
import { MemoryRouter } from 'react-router-dom';

// Create a mutable variable for location state (to test both with and without acct)
let mockLocationState = {
  hotelName: 'Marina Bay Sands',
  hotelAddr: '10 Bayfront Avenue',
  totalPrice: '1050.00',
  rates: '350.00',
  checkin: new Date('2025-08-15'),
  checkout: new Date('2025-08-18'),
  noAdults: 2,
  noChildren: 1,
  noRooms: 1,
  authToken: '',
  userRef: '',
  firstName: '',
  lastName: '',
  salutation: '',
  phoneNumber: '',
  emailAddress: ''
};

// Mock react-router-dom once & ref that var
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: mockLocationState })
  };
});

// helper to update state in tests
const setMockLocationState = (overrides: Partial<typeof mockLocationState>) => {
  mockLocationState = { ...mockLocationState, ...overrides };
};

beforeEach(() => {
  // Reset to default before each test
  setMockLocationState({
    hotelName: 'Marina Bay Sands',
    hotelAddr: '10 Bayfront Avenue',
    totalPrice: '1050.00',
    rates: '350.00',
    checkin: new Date('2025-08-15'),
    checkout: new Date('2025-08-18'),
    noAdults: 2,
    noChildren: 1,
    noRooms: 1,
    authToken: '',
    userRef: ''
  });
});


vi.mock('../components/EmptyNavBar', () => ({
  default: () => <div>Navigation Bar</div>
}));

vi.mock('../components/BookingSummary', () => ({
  default: () => <div>Booking Summary Panel</div>
}));


describe('GuestInfoPage UI Tests', () => {

    test('Guest user: renders all personal information field description', () => {
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

  test('Authenticated user - displays pre-filled info and only special request is editable', async () => {

    // Add info for authenticated user
    setMockLocationState({
      authToken: 'token123',
      userRef: 'user123',
      firstName: 'Alice',
      lastName: 'Wonderland',
      salutation: 'Ms',
      phoneNumber: '65 12345678',
      emailAddress: 'alice@example.com'
    });


    render(
      <BrowserRouter>
        <GuestInfoPage />
      </BrowserRouter>
    );

    // Prefilled info section
    expect(screen.getByRole('heading', { name: /Your Information/i })).toBeInTheDocument();
    expect(screen.getByText(/Alice Wonderland/)).toBeInTheDocument();
    expect(screen.getByText('Ms')).toBeInTheDocument();
    expect(screen.getByText('65 12345678')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();

    // No other personal info inputs
    expect(screen.queryByPlaceholderText('First Name')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Last Name')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Phone Number')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Email Address')).not.toBeInTheDocument();

    // Special request still present and editable
    const special = screen.getByPlaceholderText(/Special Request/);
    await userEvent.type(special, 'Late check-in');
    expect(special).toHaveValue('Late check-in');
  });

  
});