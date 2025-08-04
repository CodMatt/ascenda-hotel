// Unit test for fetchHotels() API under client/src/api 

/*
What this test does/ensures:
- Functions build correct URL
- Handles successful API responses 
- Will throw error when response is bad
- Works even if no hotels returned 
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHotels } from '../../src/api/hotels'; 

//  Mock the global fetch function used inside fetchHotels
vi.stubGlobal('fetch', vi.fn());

describe('fetchHotels', () => {
  // Reset mock fetch before each test to avoid test pollution
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // 1) Mock a successful fetch response
  it('returns hotel data on success', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hotels: [{ id: '1', name: 'Hotel Test' }] })
    });

    // Call function with example values (testing) --> Unit testing
    const data = await fetchHotels('RsBU', '2025-12-01', '2025-12-07', '2');

    // Expect the first hotel to match the mock ('Hotel Test' as name)
    expect(data.hotels[0].name).toBe('Hotel Test');
  });

  // 2) Ensure function throws an error when server responds with !ok (e.g. 500)
  it('throws an error when fetch returns !ok', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });

    await expect(
      fetchHotels('RsBU', '2025-12-01', '2025-12-07', '2')
    ).rejects.toThrow('Failed to fetch merged hotel data');
  });

  // 3) Make sure function still returns a valid object even if no hotels are returned
  it('returns an empty hotel list when API returns no hotels', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hotels: [] })
    });

    const data = await fetchHotels('RsBU', '2025-12-01', '2025-12-07', '2');

    // hotels key exists, but is empty
    expect(data.hotels).toEqual([]);
  });

  //  4) Ensure your function catches thrown errors (e.g. network timeout, rejected fetch)
  it('throws an error when fetch rejects (e.g. timeout)', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network timeout'));

    await expect(
      fetchHotels('RsBU', '2025-12-01', '2025-12-07', '2')
    ).rejects.toThrow('Network timeout');
  });


  // 5) Check that URL is correctly built
  it('calls fetch with correct URL and query parameters', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hotels: [] })
    });
  
    await fetchHotels('RsBU', '2025-12-01', '2025-12-07', '2');
  
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'destination_id=RsBU&checkin=2025-12-01&checkout=2025-12-07&guests=2'
      )
    );
  });
  
  
});
