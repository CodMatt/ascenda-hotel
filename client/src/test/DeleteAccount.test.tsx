import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DeleteAccount from '../components/DeleteAccount';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextType, User } from '../types/auth';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.alert
const mockAlert = vi.fn();
window.alert = mockAlert;

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock user data
const mockUser: User = {
  id: 'user123',
  username: 'testuser',
  email: 'test@example.com',
  phone_num: '1234567890',
  first_name: 'John',
  last_name: 'Doe',
  salutation: 'Mr',
  created: '2024-01-01T00:00:00Z',
};

// Helper function to render component with AuthContext
const renderWithAuth = (authValue: Partial<AuthContextType>) => {
  const defaultAuthValue: AuthContextType = {
    user: null,
    token: null,
    loading: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    ...authValue,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthValue}>
        <DeleteAccount />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('DeleteAccount Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReset();
  });

  describe('Rendering', () => {
    it('renders the delete account button', () => {
      renderWithAuth({ user: mockUser, token: 'valid-token' });
      
      expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });

    it('does not show modal initially', () => {
      renderWithAuth({ user: mockUser, token: 'valid-token' });
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Modal Functionality', () => {
    it('shows confirmation modal when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth({ user: mockUser, token: 'valid-token' });
      
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /delete account/i })).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(within(screen.getByRole('dialog')).getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });

    it('hides modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithAuth({ user: mockUser, token: 'valid-token' });
      
      // Open modal
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      
      // Close modal
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication Checks', () => {
    it('shows alert and returns early when no token is present', async () => {
      const user = userEvent.setup();
      renderWithAuth({ user: mockUser, token: null });
      
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      
      expect(mockAlert).toHaveBeenCalledWith('You must be logged in to delete your account.');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('returns early when no user ID is found', async () => {
      const user = userEvent.setup();
      const userWithoutId = { ...mockUser, id: '' };
      mockSessionStorage.getItem.mockReturnValue(null);
      
      renderWithAuth({ user: userWithoutId, token: 'valid-token' });
      
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('uses sessionStorage userId when user object id is not available', async () => {
      const user = userEvent.setup();
      const userWithoutId = { ...mockUser, id: '' };
      mockSessionStorage.getItem.mockReturnValue('session-user-id');
      
      renderWithAuth({ user: userWithoutId, token: 'valid-token' });
      
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('userId');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Account Deletion Process', () => {
    it('successfully deletes account and redirects', async () => {
      const user = userEvent.setup();
      const mockLogout = vi.fn();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Account deleted successfully' }),
      });
      
      renderWithAuth({ 
        user: mockUser, 
        token: 'valid-token',
        logout: mockLogout 
      });
      
      // Open modal and confirm deletion
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      // Click confirmation button inside modal
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: /delete account/i })
      );
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('api/users/user123', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token',
          },
        });
      });
      
      expect(mockAlert).toHaveBeenCalledWith('Account deleted successfully.');
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('handles deletion failure with error response', async () => {
      const user = userEvent.setup();
      const mockLogout = vi.fn();
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Deletion failed' }),
      });
      
      renderWithAuth({ 
        user: mockUser, 
        token: 'valid-token',
        logout: mockLogout 
      });
      
      // Open modal and confirm deletion
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      // Click confirmation button inside modal
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: /delete account/i })
      );
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to delete account.');
      });
      
      expect(mockLogout).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('closes modal after deletion attempt', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Account deleted successfully' }),
      });
      
      renderWithAuth({ user: mockUser, token: 'valid-token' });
      
      // Open modal and confirm deletion
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      // Click confirmation button inside modal
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: /delete account/i })
      );
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple rapid clicks on delete button', async () => {
      const user = userEvent.setup();
      renderWithAuth({ user: mockUser, token: 'valid-token' });
      
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      // Click multiple times rapidly
      await user.click(deleteButton);
      await user.click(deleteButton);
      await user.click(deleteButton);
      
      // Should only show one modal
      const modals = screen.queryAllByRole('dialog');
      expect(modals).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const user = userEvent.setup();
      renderWithAuth({ user: mockUser, token: 'valid-token' });
      
      // Open modal
      await user.click(screen.getByRole('button', { name: /delete account/i }));
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByRole('heading', { name: /delete account/i })).toBeInTheDocument();
    });
  });
});