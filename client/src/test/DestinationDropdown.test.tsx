import {render, screen, fireEvent} from '@testing-library/react';
import {DestinationDropdown} from '../components/DestinationDropdown';
import {expect, vi, test} from 'vitest';

//unit test for DestinationDropdown component

// Mock the useDestinations hook
test('renders and selects a destination', () => {
    const mockOnSelect = vi.fn();
    render(<DestinationDropdown onSelect={mockOnSelect} selectedDestination={null} />)

    fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Singapore' }
    });
    
    expect(screen.getByRole('textbox')).toHaveValue('Singapore');
})