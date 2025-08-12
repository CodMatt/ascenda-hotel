import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import type { User, SignupData } from '../types/auth';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create a more sophisticated mock sessionStorage that actually stores data
const createMockStorage = () => {
  const storage: { [key: string]: string } = {};
  
  return {
    getItem: vi.fn((key: string) => {
      const value = storage[key] || null;
      console.log(`Storage getItem(${key}) -> ${value}`);
      return value;
    }),
    setItem: vi.fn((key: string, value: string) => {
      console.log(`Storage setItem(${key}, ${value})`);
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      console.log(`Storage removeItem(${key})`);
      delete storage[key];
    }),
    clear: vi.fn(() => {
      console.log(`Storage clear()`);
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    _storage: storage // For debugging
  };
};

// Create mock storage instance
let mockSessionStorage: ReturnType<typeof createMockStorage>;

// Mock console methods to avoid noise in tests (but allow debug logs)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
vi.spyOn(console, 'log').mockImplementation((message, ...args) => {
  originalConsoleLog(message, ...args);
});
vi.spyOn(console, 'error').mockImplementation((message, ...args) => {
  if (typeof message === 'string' && message.includes('[AuthContext]')) {
    originalConsoleError(message, ...args);
  }
});

// Mock alert
vi.spyOn(window, 'alert').mockImplementation(() => {});

// Mock timers
vi.spyOn(global, 'setInterval');
vi.spyOn(global, 'clearInterval');

describe('AuthProvider', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone_num: '1234567890',
    salutations: 'Mr.',
    username: '',
    created: ''
  };

  const mockToken = 'mock-jwt-token';

  const mockSignupData: SignupData = {
    email: 'test@example.com',
    password: 'password123',
    first_name: 'John',
    last_name: 'Doe',
    phone_num: '1234567890',
    salutation: 'Mr.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    
    // Create fresh mock storage for each test
    mockSessionStorage = createMockStorage();
    
    // Replace the global sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });
    
    // Reset fetch mock to ensure clean state
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with null user and loading true when no token in storage', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.loading).toBe(true);
    });

    it('should initialize with token from storage and verify it', async () => {
      // Pre-populate storage
      mockSessionStorage.setItem('token', mockToken);
      mockSessionStorage.setItem('userId', '123');

      // Mock the token verification call that will happen on mount
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Should have token immediately from storage
      expect(result.current.token).toBe(mockToken);

      // Wait for token verification API call to complete and user to be set
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/users/123', {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        });
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      }, { timeout: 3000 });
    });
  });

  describe('Token Verification', () => {
    it('should verify token on mount when token exists', async () => {
      // Pre-populate storage
      mockSessionStorage.setItem('token', mockToken);
      mockSessionStorage.setItem('userId', '123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/users/123', {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        });
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should logout when token verification fails', async () => {
      // Pre-populate storage
      mockSessionStorage.setItem('token', mockToken);
      mockSessionStorage.setItem('userId', '123');

      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockSessionStorage.clear).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
      });

      expect(window.alert).toHaveBeenCalledWith('Your session has expired. Please log in again.');
    });

    it('should logout when userId or token is missing', async () => {
      // Pre-populate storage with token but no userId
      mockSessionStorage.setItem('token', mockToken);
      // Don't set userId - this should trigger logout

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for the verification logic to detect missing userId and call logout
      await waitFor(() => {
        expect(mockSessionStorage.clear).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
      }, { timeout: 3000 });
    });

    it('should handle token verification network errors', async () => {
      // Pre-populate storage
      mockSessionStorage.setItem('token', mockToken);
      mockSessionStorage.setItem('userId', '123');

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Token verification failed:', expect.any(Error));
        expect(mockSessionStorage.clear).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
      });
    });

    it('should set up interval for token verification', async () => {
      // Pre-populate storage
      mockSessionStorage.setItem('token', mockToken);
      mockSessionStorage.setItem('userId', '123');

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
      });
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      // Create a real Response object for the mock
      const mockLoginResponse = {
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          user: mockUser
        })
      };

      // Mock the login fetch call
      mockFetch.mockResolvedValueOnce(mockLoginResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Perform login and wait for completion
      let loginResponse: any;
      await act(async () => {
        loginResponse = await result.current.login('test@example.com', 'password123');
      });

      // Verify the response
      expect(loginResponse.ok).toBe(true);

      // Verify fetch was called correctly
      expect(mockFetch).toHaveBeenCalledWith('api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      // Verify storage operations
      expect(mockSessionStorage.clear).toHaveBeenCalled();
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('userId', mockUser.id);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('emailAddress', mockUser.email);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('firstName', mockUser.first_name);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('lastName', mockUser.last_name);
    });

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResponse: any;
      await act(async () => {
        loginResponse = await result.current.login('test@example.com', 'wrongpassword');
      });
      
      expect(loginResponse.ok).toBe(false);
      expect(result.current.user).toBeNull();
      // Token should still be null since login failed
      expect(result.current.token).toBeNull();
    });

    it('should handle login network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Signup', () => {
    it('should signup successfully', async () => {
      // First mock the signup call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'User created successfully' }),
      });

      // Then mock the auto-login call
      const mockLoginResponse = {
        ok: true,
        json: () => Promise.resolve({
          token: mockToken,
          user: mockUser,
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockLoginResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signup(mockSignupData);
      });

      // Verify signup API call
      expect(mockFetch).toHaveBeenCalledWith('api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSignupData),
      });

      // Verify auto-login API call
      expect(mockFetch).toHaveBeenCalledWith('api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockSignupData.email,
          password: mockSignupData.password,
        }),
      });

      // Verify storage updates from the auto-login
      expect(mockSessionStorage.clear).toHaveBeenCalled();
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('userId', mockUser.id);
    });

    it('should handle signup failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signupResponse: any;
      await act(async () => {
        signupResponse = await result.current.signup(mockSignupData);
      });

      expect(signupResponse.ok).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });

    it('should handle signup success but auto-login failure', async () => {
      // Mock successful signup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'User created successfully' }),
      });

      // Mock failed auto-login
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.signup(mockSignupData);
        })
      ).rejects.toThrow('Auto-login failed after signup');

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Set up initial state with user and token
      mockSessionStorage.setItem('token', mockToken);
      mockSessionStorage.setItem('userId', '123');
      
      // Mock the initial token verification
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial token verification to complete
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.token).toBe(mockToken);
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });

    it('should logout successfully from clean state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should provide auth context when used within AuthProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('token');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('signup');
      expect(result.current).toHaveProperty('logout');
    });
  });

  describe('Component Integration', () => {
    it('should render children components', () => {
      const TestComponent = () => <div data-testid="test-child">Test Child</div>;

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  describe('Storage Utils', () => {
    it('should use sessionStorage by default', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });
});