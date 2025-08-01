import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HotelSearchForm from '../components/HotelSearchForm';
import { expect, vi, test } from 'vitest';
import React from 'react';
import { Destination } from '../types/destination';

test('submits the search when valid destination and dates are selected', async () => {
    const mockSearch = vi.fn();

    render(<HotelSearchForm onSearch={mockSearch} />);

    const destinationInput = screen.getByLabelText('Destination');
    fireEvent.change(destinationInput, { target: { value: 'Singapore' } });

    // Wait for dropdown option to appear
    await waitFor(() => {
        expect(screen.getByText('Singapore, Singapore')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Singapore, Singapore'));

    fireEvent.click(screen.getByText('Search Hotels'));

    await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith(
            expect.objectContaining({
                destinationId: 'RsBU', // ← matches mock response
                checkin: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                checkout: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                guests: '2', // ← selected default or test-controlled
                lang: 'en_US',
                currency: 'SGD',
                country_code: 'SG',
            })
        );
    });
});