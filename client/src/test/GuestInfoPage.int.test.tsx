// src/test/GuestInfoPage.int.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuestInfoPage from '../pages/GuestInfoPage';

// ----- Mocks for validators -----
vi.mock('../lib/IsNameValid', () => ({ default: vi.fn(() => true) }));
vi.mock('../lib/IsEmailValid', () => ({ default: vi.fn(() => true) }));
vi.mock('../lib/IsCountryValid', () => ({ default: vi.fn(() => true) }));
vi.mock('../lib/IsPhoneNumberValid', () => ({ default: vi.fn(() => true) }));

// Country codes: map country -> [dial values, codeString]
vi.mock('../lib/CountryCodes', () => ({
  default: {
    Singapore: [[65], '+65'],
    India: [[91], '+91'],
    others: [[0], ''],
  },
}));

// CalculateNights can be real or mocked; keeping it simple:
vi.mock('../lib/CalculateNights', () => ({ default: (ci: string, co: string) => 2 }));

// ----- Stub presentational deps to avoid layout noise -----
vi.mock('../components/BookingSummary', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="booking-summary">{props.hotelName}</div>,
}));
vi.mock('../components/EmptyNavBar', () => ({
  __esModule: true,
  default: () => <div data-testid="empty-nav" />,
}));

// Notifications mocked to stable text so we can assert easily
vi.mock('../components/notifications/InvalidPhoneNotification', () => ({
  __esModule: true,
  default: () => <div>Invalid phone</div>,
}));
vi.mock('../components/notifications/InvalidEmailNotification', () => ({
  __esModule: true,
  default: () => <div>Invalid email</div>,
}));
vi.mock('../components/notifications/InvalidFirstNameNotification', () => ({
  __esModule: true,
  default: () => <div>Invalid first</div>,
}));
vi.mock('../components/notifications/InvalidLastNameNotification', () => ({
  __esModule: true,
  default: () => <div>Invalid last</div>,
}));
vi.mock('../components/notifications/InvalidCountryNotification', () => ({
  __esModule: true,
  default: () => <div>Invalid country</div>,
}));

// spy navigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// ----- Helpers -----
function makeLocationState(overrides: Partial<Record<string, any>> = {}) {
  return {
    hotelId: 'H1',
    destId: 'D1',
    hotelName: 'Great Hotel',
    hotelAddr: '123 Street',
    key: 'rateKey',
    rates: [{ id: 'r1' }],
    checkin: '2025-08-10',
    checkout: '2025-08-12',
    noAdults: 2,
    noChildren: 0,
    noNights: 2,
    totalPrice: 500,
    noRooms: 1,
    userRef: 'U123',
    roomType: 'Deluxe',
    // personal info defaults
    firstName: 'Ada',
    lastName: 'Lovelace',
    salutation: 'Ms',
    phoneNumber: '+65 81234567',
    emailAddress: 'ada@example.com',
    specialRequest: '',
    // country defaults (for auth flow we don't use these)
    country: 'Singapore',
    countryCode: '+65',
    // auth controlled per test
    authToken: true,
    ...overrides,
  };
}

function renderWithRouter(state: any) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/guest', state } as any]}>
      <Routes>
        <Route path="/guest" element={<GuestInfoPage />} />
        {/* dummy target route so router accepts navigation */}
        <Route path="/payment" element={<div data-testid="payment-page">Payment</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  navigateMock.mockReset();
  vi.clearAllMocks(); // keeps module mocks, resets fn call history
});

describe('GuestInfoPage integration', () => {
  it('renders with booking summary and progress UI', () => {
    renderWithRouter(makeLocationState());
    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    expect(screen.getByTestId('booking-summary')).toHaveTextContent('Great Hotel');
    expect(screen.getAllByText('✓').length).toBeGreaterThan(0);
  });

  it('authenticated user: shows read-only info and navigates to /payment on submit', async () => {
    const user = userEvent.setup();
    renderWithRouter(makeLocationState({ authToken: true }));

    expect(screen.getByText(/Your Information/i)).toBeInTheDocument();
    // No editable First Name input visible in auth mode
    expect(screen.queryByPlaceholderText('First Name')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Proceed to Payment/i }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    const [to, opts] = navigateMock.mock.calls[0];
    expect(to).toBe('/payment');
    expect(opts).toMatchObject({
      state: expect.objectContaining({
        userRef: 'U123',
        roomType: 'Deluxe',
        firstName: 'Ada',
        lastName: 'Lovelace',
        emailAddress: 'ada@example.com',
        hotelId: 'H1',
        totalPrice: 500,
        duration: 2,
        authToken: true,
      }),
    });
  });

  it('unauthenticated user: invalid inputs show error notifications', async () => {
  const user = userEvent.setup();

  // Force validators to fail
  const isNameValid = (await import('../lib/IsNameValid')).default as any;
  const isEmailValid = (await import('../lib/IsEmailValid')).default as any;
  const isPhoneValid = (await import('../lib/IsPhoneNumberValid')).default as any;
  const isCountryValid = (await import('../lib/IsCountryValid')).default as any;
  isNameValid.mockReturnValue(false);
  isEmailValid.mockReturnValue(false);
  isPhoneValid.mockReturnValue(false);
  isCountryValid.mockReturnValue(false);

  renderWithRouter(makeLocationState({
    authToken: false,
    firstName: '',
    lastName: '',
    emailAddress: '',
    country: '',
    countryCode: '',
    phoneNumber: '',
  }));

  // Fill ONLY what the browser requires so submit actually fires.
  // (Validators still return false so we should see the mocked error components.)
  const salutationGroup = screen.getByText('Salutation').closest('.form-group')!;
  const salutationSelect = within(salutationGroup).getByRole('combobox');
  await user.selectOptions(salutationSelect, 'Mr');

  await user.type(screen.getByPlaceholderText('First Name'), 'A');
  await user.type(screen.getByPlaceholderText('Last Name'), 'B');

  const countryGroup = screen.getByText('Country').closest('.form-group')!;
  const countrySelect = within(countryGroup).getByRole('combobox');
  await user.selectOptions(countrySelect, 'Singapore'); // enables phone + fills +65

  await user.type(screen.getByPlaceholderText('Phone Number'), '123');
  await user.type(screen.getByPlaceholderText('Email Address'), 'x@y.z');

  // Submit
  await user.click(screen.getByRole('button', { name: /Proceed to Payment/i }));

  // Wait for errors to render; then assert and ensure no navigation
  await screen.findByText('Invalid first');
  await screen.findByText('Invalid last');
  await screen.findByText('Invalid country');
  await screen.findByText('Invalid phone');
  await screen.findByText('Invalid email');

  expect(navigateMock).not.toHaveBeenCalled();
});

  it('unauthenticated user: valid inputs update country code and navigate with full phone number', async () => {
    const user = userEvent.setup();

    // Force validators to succeed
    const isNameValid = (await import('../lib/IsNameValid')).default as any;
    const isEmailValid = (await import('../lib/IsEmailValid')).default as any;
    const isPhoneValid = (await import('../lib/IsPhoneNumberValid')).default as any;
    const isCountryValid = (await import('../lib/IsCountryValid')).default as any;
    isNameValid.mockReturnValue(true);
    isEmailValid.mockReturnValue(true);
    isPhoneValid.mockImplementation((_phone, country, code) => !!country && !!code);
    isCountryValid.mockImplementation((country) => !!country);

    renderWithRouter(makeLocationState({
      authToken: false,
      firstName: '',
      lastName: '',
      emailAddress: '',
      phoneNumber: '',
      country: '',
      countryCode: '',
    }));

    // Salutation <select> – scope to its form-group and grab combobox
    const salutationGroup = screen.getByText('Salutation').closest('.form-group')!;
    const salutationSelect = within(salutationGroup).getByRole('combobox');
    await user.selectOptions(salutationSelect, 'Mr');

    // Text inputs without label association → use placeholders
    await user.type(screen.getByPlaceholderText('First Name'), 'Alan');
    await user.type(screen.getByPlaceholderText('Last Name'), 'Turing');

    // Country <select> – scope then pick combobox
    const countryGroup = screen.getByText('Country').closest('.form-group')!;
    const countrySelect = within(countryGroup).getByRole('combobox');
    await user.selectOptions(countrySelect, 'Singapore'); // sets +65

    // Now phone fields (enabled after country is selected)
    const codeInput = screen.getByPlaceholderText('Code');
    expect(codeInput).toHaveValue('+65');

    const phoneInput = screen.getByPlaceholderText('Phone Number');
    await user.type(phoneInput, '81234567');

    // Email input
    await user.type(screen.getByPlaceholderText('Email Address'), 'alan@example.com');

    // Submit
    await user.click(screen.getByRole('button', { name: /Proceed to Payment/i }));

    expect(navigateMock).toHaveBeenCalledTimes(1);
    const [to, opts] = navigateMock.mock.calls[0];
    expect(to).toBe('/payment');
    expect(opts.state.phoneNumber).toBe('+65 81234567');
    expect(opts.state.authToken).toBe(false);
  });
});
