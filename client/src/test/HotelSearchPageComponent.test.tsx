// client/tests/pages/HotelSearchPage.test.tsx
import React from 'react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ---- SUT ----
import HotelSearchPage from '../pages/HotelSearchPage'

// ---- Mocks ----

// stub NavBar so it doesn't call useAuth
vi.mock('../../src/components/NavBar', () => ({
  default: () => <div data-testid="navbar-stub" />,
}))

// 1) Mock MapboxMap so tests don’t load Mapbox
vi.mock('../../src/components/MapboxMap', () => ({
  default: ({ hotels }: any) => (
    <div data-testid="map-stub" data-count={hotels?.length ?? 0} />
  )
}))

// 2) Mock fetchHotels so we can control responses
const fetchHotelsMock = vi.fn()
vi.mock('../../src/api/hotels', () => ({
  fetchHotels: (...args: any[]) => fetchHotelsMock(...args)
}))

// 3) Make a controllable IntersectionObserver mock
let ioCallback: (entries: any[]) => void
class IOStub {
  constructor(cb: any) { ioCallback = cb }
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', IOStub as any)

// Helper: render with router + location.state carrying searchParams
function renderWithState(state?: any) {
  // MemoryRouter supports initialEntries with state
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/hotels', state }]}>
      <HotelSearchPage />
    </MemoryRouter>
  )
}

// Sample data returned by backend
const sampleHotels = [
  {
    id: 'h1',
    name: 'Alpha Hotel',
    rating: 4.2,
    price: 300, // total price for stay
    image: 'https://img/p1.jpg',
    latitude: 1.3,
    longitude: 103.8,
    address: '1 Alpha Street'
  },
  {
    id: 'h2',
    name: 'Bravo Inn',
    rating: 3.8,
    price: 210,
    image: null, // triggers "No image"
    latitude: null,
    longitude: null,
    address: '2 Bravo Road'
  },
  {
    id: 'h3',
    name: 'Charlie Suites',
    rating: 4.9,
    price: 600,
    image: 'https://img/p3.jpg',
    latitude: 1.31,
    longitude: 103.82,
    address: '3 Charlie Ave'
  }
]

const stateOK = {
  searchParams: {
    destinationId: 'RsBU',
    checkin: '2025-12-01',
    checkout: '2025-12-04', // 3 nights
    guests: '2',
    adults: '2',
    children: '0'
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('HotelSearchPage (Feature 2: list of hotels)', () => {
  it('shows an error when required search parameters are missing', async () => {
    renderWithState({}) // no searchParams
    expect(await screen.findByText(/missing required search parameters/i)).toBeInTheDocument()
    // loader should disappear
    expect(screen.queryByText(/fetching hotels/i)).not.toBeInTheDocument()
  })

  it('shows loading then renders hotels from API', async () => {
    fetchHotelsMock.mockResolvedValueOnce({ hotels: sampleHotels })

    renderWithState(stateOK)

    // shows loading
    expect(screen.getByText(/fetching hotels/i)).toBeInTheDocument()

    // then renders hotel cards
    await screen.findByText('Alpha Hotel')
    expect(screen.getByText('Bravo Inn')).toBeInTheDocument()
    expect(screen.getByText('Charlie Suites')).toBeInTheDocument()

    // map stub gets only hotels with coordinates
    const map = screen.getByTestId('map-stub')
    expect(map.getAttribute('data-count')).toBe('2') // h1 + h3
  })

  it('computes price per night from total price and nights', async () => {
    // 3 nights → Alpha: 300 / 3 = 100.00
    fetchHotelsMock.mockResolvedValueOnce({ hotels: sampleHotels })
    renderWithState(stateOK)

    const card = await screen.findByText('Alpha Hotel')
    const cardRoot = await screen.findByRole('link', { name: /alpha hotel/i })
    expect(within(cardRoot).getByText('$100.00')).toBeInTheDocument()
    expect(within(cardRoot).getByText(/\/ night/i)).toBeInTheDocument()
  })

  it('shows image fallback when no image is provided', async () => {
    fetchHotelsMock.mockResolvedValueOnce({ hotels: sampleHotels })
    renderWithState(stateOK)

    const bravo = await screen.findByText('Bravo Inn')
    const bravoCard = await screen.findByRole('link', { name: /bravo inn/i })
    expect(within(bravoCard).getByText(/no image/i)).toBeInTheDocument()
  })

// filters by star rating via the 4-Star button and clears it
it('filters by star rating via the 4-Star button and clears it', async () => {
  fetchHotelsMock.mockResolvedValueOnce({ hotels: sampleHotels })
  renderWithState(stateOK)

  await screen.findByText('Alpha Hotel') // wait for load

  // Click 4-Star (keeps floor(rating) === 4 → Alpha(4.2) & Charlie(4.9))
  fireEvent.click(screen.getByRole('button', { name: /4-star/i }))
  expect(screen.getByText('Alpha Hotel')).toBeInTheDocument()
  expect(screen.getByText('Charlie Suites')).toBeInTheDocument()
  expect(screen.queryByText('Bravo Inn')).not.toBeInTheDocument() // 3.8 drops

  // Clear Star → all return
  fireEvent.click(screen.getByRole('button', { name: /clear star/i }))
  expect(screen.getByText('Alpha Hotel')).toBeInTheDocument()
  expect(screen.getByText('Bravo Inn')).toBeInTheDocument()
  expect(screen.getByText('Charlie Suites')).toBeInTheDocument()
})


  it('changes sort order via the dropdown (price low→high)', async () => {
    fetchHotelsMock.mockResolvedValueOnce({ hotels: sampleHotels })
    renderWithState(stateOK)

    await screen.findByText('Alpha Hotel')

    // open select and choose "Price (low to high)"
    const select = screen.getByDisplayValue('Sort By')
    fireEvent.change(select, { target: { value: 'priceAsc' } })

    // read the order of rendered cards by their headings
    const names = Array.from(screen.getAllByRole('heading', { level: 3 })).map(h => h.textContent)
    // Bravo (210) → Alpha (300) → Charlie (600)
    expect(names).toEqual(['Bravo Inn', 'Alpha Hotel', 'Charlie Suites'])
  })

  it('lazy loads more cards when the sentinel intersects', async () => {
    // Generate 50 hotels so we can test visibleCount growth (starts at 30)
    const bigList = Array.from({ length: 50 }, (_, i) => ({
      id: `id${i}`, name: `Hotel ${i}`, rating: 4, price: 100 + i,
      image: null, latitude: null, longitude: null, address: `Addr ${i}`
    }))
    fetchHotelsMock.mockResolvedValueOnce({ hotels: bigList })
    renderWithState(stateOK)

    // initial: 30 cards
    await screen.findByText('Hotel 0')
    const firstBatch = screen.getAllByRole('heading', { level: 3 })
    expect(firstBatch.length).toBe(30)

    // trigger IntersectionObserver
    ioCallback?.([{ isIntersecting: true } as any])
    await waitFor(() => {
      const more = screen.getAllByRole('heading', { level: 3 })
      expect(more.length).toBe(40)
    })
  })

  it('renders detail links with correct href', async () => {
    fetchHotelsMock.mockResolvedValueOnce({ hotels: sampleHotels })
    renderWithState(stateOK)

    const alpha = await screen.findByText('Alpha Hotel')
    const cardRoot = alpha.closest('.hotel-card') as HTMLAnchorElement
    expect(cardRoot).toHaveAttribute('href', '/hotels/h1')
  })
})
