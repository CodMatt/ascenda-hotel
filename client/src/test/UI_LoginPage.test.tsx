import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import LoginPage from '../pages/LoginPage';

// ----- Mocks  -----
const navigateMock = vi.fn();
const loginMock = vi.fn();

// react-router: mock useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Auth context: mock useAuth -> returns login function we control
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}));

// Notification: replace with simple stub so we can assert it appears
vi.mock('../components/notifications/LoginSuccess', () => ({
  default: () => <div>Login Success</div>,
}));

// (Optional) asset mock if your test runner complains about image imports
vi.mock('../assets/logo.png', () => ({ default: 'logo.png' }));

function renderPage() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
}

beforeEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  navigateMock.mockReset();
  loginMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('UI: LoginPage & LoginForm', () => {
  test('renders logo, title, inputs, and buttons', () => {
    renderPage();

    // Title & logo
    expect(screen.getByRole('heading', { name: /log in to your account/i })).toBeInTheDocument();
    expect(screen.getByAltText(/ascenda logo/i)).toBeInTheDocument();

    // Inputs
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  test('wrong password shows specific error', async () => {
    loginMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid username/password' }),
    });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByText(/wrong password\./i)).toBeInTheDocument();
  });

  test('no account shows specific error', async () => {
    loginMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'No account with that email exists' }),
    });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'nope@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'whatever' } });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByText(/no account with that email exists\./i)).toBeInTheDocument();
  });

  test('generic backend failure shows "Login failed"', async () => {
    loginMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}), // no error field
    });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'Hello1234' } });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });

  test('network error shows "Network error occurred"', async () => {
    loginMock.mockRejectedValueOnce(new Error('boom'));

    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'Hello1234' } });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(await screen.findByText(/network error occurred/i)).toBeInTheDocument();
  });

  test('Back button navigates -1 when idle', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
