
  import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
  import { render, screen, waitFor } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { MemoryRouter, Routes, Route } from 'react-router-dom';
  import { AuthProvider } from '../context/AuthContext';
  import HotelDetailsPage from '../pages/HotelDetailsPage';

  vi.mock('../api/hotels', () => ({
    fetchHotelDetails: vi.fn(),
    fetchHotelRoomPrices: vi.fn(),
  }));

  import { fetchHotelDetails, fetchHotelRoomPrices } from '../api/hotels';

  function CheckHotelDetailsPage() {
    return <h1>Check Hotel Details Page</h1>;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithRouter(initialPath = '/hotel/123') {
    return render(
      <AuthProvider>
        <MemoryRouter
          initialEntries={[
            {
              pathname: initialPath,
              state: {
                searchParams: {
                  destinationId: 'WD0M',
                  checkin: '2025-10-11',
                  checkout: '2025-10-13',
                  guests: '2',
                  adults: 2,
                  children: 0,
                },
              },
            },
          ]}
        >
          <Routes>
            <Route path="/hotel/:id" element={<HotelDetailsPage />} />
            <Route path="/checkhoteldetailspage" element={<CheckHotelDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  }

  describe('HotelDetailsPage navigation', () => {
    it('navigates to /checkhoteldetailspage when a room is selected', async () => {
      // Arrange: mock API responses
      (fetchHotelDetails as Mock).mockResolvedValue({
        name: 'Test Hotel',
        address: '123 Street',
        rating: 4,
        latitude: 1.3,
        longitude: 103.8,
        amenities: { wifi: true },
        description: '',
        image_details: { prefix: 'img-', suffix: '.jpg', count: 1 },
      });

      (fetchHotelRoomPrices as Mock).mockResolvedValue({
        completed: true,
        rooms: [
          {
            key: 'room1',
            roomDescription: 'Deluxe Room',
            converted_price: 200,
            images: [{ url: 'https://via.placeholder.com/150' }],
            roomAdditionalInfo: { breakfastInfo: '' },
            free_cancellation: true,
          },
        ],
      });

      const user = userEvent.setup();
      renderWithRouter();

      expect(await screen.findByRole('heading', { name: /test hotel/i })).toBeInTheDocument();

      const selectBtn = await screen.findByRole('button', { name: /select/i });
      await user.click(selectBtn);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /check hotel details page/i }))
          .toBeInTheDocument();
      });
    });
  });