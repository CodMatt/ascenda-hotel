import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DestinationSearchPage from '../pages/DestinationSearchPage';

let navigateMock: ReturnType<typeof vi.fn>;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../components/NavBar', () => ({
  default: () => <div>Navigation Bar</div>,
}));

// Mock the form so we can trigger onSearch and pass realistic params
vi.mock('../components/HotelSearchForm', () => ({
  default: ({ onSearch }: { onSearch: (params: any) => void }) => (
    <div>
      <div>Hotel Search Form</div>
      <button
        onClick={() =>
          onSearch({
            destinationId: 'SGP.Singapore',
            checkin: '2025-08-15',
            checkout: '2025-08-18',
            guests: '2',
            adults: 2,
            children: 0,
            lang: 'en_US',
            currency: 'SGD',
            country_code: 'SG',
          })
        }
      >
        Trigger Search
      </button>
    </div>
  ),
}));

beforeEach(() => {
  navigateMock = vi.fn();
});

describe('DestinationSearchPage UI Tests', () => {
  test('Page title and subtitle are displayed', () => {
    render(
      <BrowserRouter>
        <DestinationSearchPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Discover Your Perfect Stay')).toBeInTheDocument();
    expect(
      screen.getByText('Search availability, pick dates, and customise guests & rooms.')
    ).toBeInTheDocument();
  });

  test('NavBar and HotelSearchForm are rendered', () => {
    render(
      <BrowserRouter>
        <DestinationSearchPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Navigation Bar')).toBeInTheDocument();
    expect(screen.getByText('Hotel Search Form')).toBeInTheDocument();
  });

  test('Navigates to HotelSearchPage with state when onSearch is triggered', () => {
    render(
      <BrowserRouter>
        <DestinationSearchPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Trigger Search'));

    expect(navigateMock).toHaveBeenCalledWith('/HotelSearchPage', {
      state: {
        searchParams: {
          destinationId: 'SGP.Singapore',
          checkin: '2025-08-15',
          checkout: '2025-08-18',
          guests: '2',
          adults: 2,
          children: 0,
          lang: 'en_US',
          currency: 'SGD',
          country_code: 'SG',
        },
      },
    });
  });

  test('Shows error message if navigation fails', () => {
    navigateMock.mockImplementationOnce(() => {
      throw new Error('navigation failed');
    });

    render(
      <BrowserRouter>
        <DestinationSearchPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Trigger Search'));

    expect(
      screen.getByText('Failed to search for hotels. Please try again.')
    ).toBeInTheDocument();
  });

  test('Footer blocks and links are displayed', () => {
    render(
      <BrowserRouter>
        <DestinationSearchPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Ascenda')).toBeInTheDocument();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();

    // basic sanity: 3 links exist
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });
});
