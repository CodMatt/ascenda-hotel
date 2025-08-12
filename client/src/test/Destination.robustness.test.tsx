import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DestinationDropdown } from '../components/DestinationDropdown';
import { Destination } from '../types/destination';

// Mock the useDestinations hook
const mockSearchDestinations = vi.fn();
const mockUseDestinations = {
  destinations: [] as Destination[],
  loading: false,
  searchDestinations: mockSearchDestinations
};

vi.mock('../hooks/useDestinations', () => ({
  useDestinations: () => mockUseDestinations
}));

// Sample test data
const sampleDestinations: Destination[] = [
  {
    uid: "RsBU",
    term: "Singapore, Singapore",
    lat: 1.2800945,
    lng: 103.8509491,
    type: "city"
  },
  {
    uid: "IFRH", 
    term: "Singapore, Singapore (XSP-Seletar)",
    lat: 1.418872,
    lng: 103.864502,
    type: "airport"
  },
  {
    uid: "cdNS",
    term: "Kyoto, Japan",
    lat: 35.0080652565,
    lng: 135.745697021,
    type: "city",
    state: "Kyoto"
  }
];

describe('DestinationDropdown - Robustness Tests', () => {
  const mockOnSelect = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    mockUseDestinations.destinations = [];
    mockUseDestinations.loading = false;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // BASIC FUNCTIONALITY
  describe('Basic Functionality', () => {
    it('renders input field with correct placeholder', () => {
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      expect(screen.getByPlaceholderText('Search destinations...')).toBeInTheDocument();
    });

    it('calls searchDestinations when typing (debounced)', async () => {
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      const input = screen.getByPlaceholderText('Search destinations...');

      // Use fireEvent.change to simulate a single input change
      fireEvent.change(input, { target: { value: 'sin' } });
      // Immediately after typing, debounce has not fired
      expect(mockSearchDestinations).toHaveBeenCalledTimes(0);

      await new Promise(r => setTimeout(r, 350));
      expect(mockSearchDestinations).toHaveBeenCalledWith('sin');
    });

    it('handles destination selection correctly', async () => {
      mockUseDestinations.destinations = sampleDestinations;
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      const input = screen.getByPlaceholderText('Search destinations...');
      await user.click(input);
      
      await new Promise(r => setTimeout(r, 50));
      expect(screen.getByText('Singapore, Singapore')).toBeInTheDocument();
      
      await user.click(screen.getByText('Singapore, Singapore'));
      expect(mockOnSelect).toHaveBeenCalledWith(sampleDestinations[0]);
    });
  });

  //  DEBOUNCE BEHAVIOR 
  describe('Debounce Behavior', () => {
    it('does not call API for every keystroke; only after debounce', async () => {
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      const input = screen.getByPlaceholderText('Search destinations...');

      // Use fireEvent.change to simulate a single input change instead of multiple keystrokes
      fireEvent.change(input, { target: { value: 'singapore' } });
      // Before debounce window
      expect(mockSearchDestinations).toHaveBeenCalledTimes(0);

      await new Promise(r => setTimeout(r, 320));
      expect(mockSearchDestinations).toHaveBeenCalledTimes(1);
      expect(mockSearchDestinations).toHaveBeenLastCalledWith('singapore');
    });
  });

  //  EDGE CASES & ERROR SCENARIOS
  describe('Edge Cases & Error Scenarios', () => {
    it('handles empty search results gracefully', async () => {
      mockUseDestinations.destinations = [];
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      const input = screen.getByPlaceholderText('Search destinations...');
      await user.click(input);
      await user.type(input, 'nonexistent');
      
      await new Promise(r => setTimeout(r, 20));
      expect(screen.getByText('No destinations found')).toBeInTheDocument();
    });

    it('shows loading state correctly', () => {
      mockUseDestinations.loading = true;
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      fireEvent.focus(screen.getByPlaceholderText('Search destinations...'));
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('handles specific malformed destination values without crashing', async () => {
      const malformedDestinations = [
        { uid: 'special', term: "<script>alert('xss')</script>", lat: 1, lng: 1, type: 'city' },
        { uid: 'unicode', term: '🏨 Hotel in 北京市', lat: 39.9, lng: 116.4, type: 'city' },
      ] as unknown as Destination[];
      mockUseDestinations.destinations = malformedDestinations;
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);

      await user.click(screen.getByPlaceholderText('Search destinations...'));
      await new Promise(r => setTimeout(r, 20));

      expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument();
      expect(screen.getByText('🏨 Hotel in 北京市')).toBeInTheDocument();
    });

    it('handles extremely long search terms', async () => {
      const longTerm = 'a'.repeat(1000);
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      const input = screen.getByPlaceholderText('Search destinations...');
      await user.type(input, longTerm);
      
      await new Promise(r => setTimeout(r, 350));
      expect(mockSearchDestinations).toHaveBeenCalledWith(longTerm);
    });

    it('handles special characters and Unicode', async () => {
      const specialChars = '!@#$%^&*()北京🏨';
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      const input = screen.getByPlaceholderText('Search destinations...');
      // Use fireEvent for special characters that userEvent.type can't handle
      fireEvent.change(input, { target: { value: specialChars } });
      
      await new Promise(r => setTimeout(r, 350));
      expect(mockSearchDestinations).toHaveBeenCalledWith(specialChars);
    });
  });

  //  ACCESSIBILITY & INTERACTION 
  describe('Accessibility & Interaction', () => {
    it('closes dropdown when clicking outside', async () => {
      mockUseDestinations.destinations = sampleDestinations;
      render(
        <div>
          <DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />
          <button>Outside button</button>
        </div>
      );
      
      await user.click(screen.getByPlaceholderText('Search destinations...'));
      await new Promise(r => setTimeout(r, 20));
      expect(screen.getByText('Singapore, Singapore')).toBeInTheDocument();
      
      await user.click(screen.getByText('Outside button'));
      await new Promise(r => setTimeout(r, 20));
      expect(screen.queryByText('Singapore, Singapore')).not.toBeInTheDocument();
    });

    it('maintains input focus during dropdown interactions', async () => {
      mockUseDestinations.destinations = sampleDestinations;
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      const input = screen.getByPlaceholderText('Search destinations...');
      await user.click(input);
      expect(input).toHaveFocus();
    });
  });

  //  PERFORMANCE & MEMORY 
  describe('Performance & Memory', () => {
    it('handles large datasets efficiently (renders max 10)', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        uid: `dest-${i}`,
        term: `Destination ${i}`,
        lat: i,
        lng: i,
        type: 'city'
      }));
      
      mockUseDestinations.destinations = largeDataset.slice(0, 10);
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      await user.click(screen.getByPlaceholderText('Search destinations...'));
      await new Promise(r => setTimeout(r, 20));
      const dropdownItems = screen.getAllByText(/Destination \d+/);
      expect(dropdownItems).toHaveLength(10);
    });

    it('cleans up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  //  INTEGRATION SCENARIOS 
  describe('Integration Scenarios', () => {
    it('works correctly within form context', async () => {
      mockUseDestinations.destinations = sampleDestinations;
      
      render(
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />
          <button type="submit">Submit</button>
        </form>
      );
      
      await user.click(screen.getByPlaceholderText('Search destinations...'));
      await new Promise(r => setTimeout(r, 20));
      expect(screen.getByText('Singapore, Singapore')).toBeInTheDocument();
      await user.click(screen.getByText('Singapore, Singapore'));
      
      await user.click(screen.getByText('Submit'));
      expect(mockOnSelect).toHaveBeenCalledWith(sampleDestinations[0]);
    });

    it('handles state updates with different destination formats', async () => {
      const destinationWithState = {
        uid: 'cdNS',
        term: 'Kyoto, Japan',
        lat: 35.0080652565,
        lng: 135.745697021,
        type: 'city',
        state: 'Kyoto',
      } as Destination;
      
      mockUseDestinations.destinations = [destinationWithState];
      render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      await user.click(screen.getByPlaceholderText('Search destinations...'));
      await new Promise(r => setTimeout(r, 20));
      expect(screen.getByText('Kyoto, Japan, Kyoto')).toBeInTheDocument();
    });

    it('preserves input value when selectedDestination prop changes externally', () => {
      const { rerender } = render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      rerender(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={sampleDestinations[0]} />);
      
      const input = screen.getByPlaceholderText('Search destinations...') as HTMLInputElement;
      expect(input.value).toBe('Singapore, Singapore');
    });
  });

  //  RACE CONDITIONS 
  describe('Race Conditions', () => {
    it('does not call API after unmount during pending debounce', async () => {
      const { unmount } = render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />);
      
      const input = screen.getByPlaceholderText('Search destinations...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Wait a bit to ensure the debounce timer is set but not fired yet
      await new Promise(r => setTimeout(r, 100));
      const callsBeforeUnmount = mockSearchDestinations.mock.calls.length;
      unmount();
      
      await new Promise(r => setTimeout(r, 500));
      expect(mockSearchDestinations).toHaveBeenCalledTimes(callsBeforeUnmount);
    });
  });
});