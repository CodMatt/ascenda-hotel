import { describe, it, expect, vi } from 'vitest';
import { fetchWithRetry } from '../utils/fetchWithRetry'; 

describe("fetchWithRetry", () => {
  it("retries multiple times if hotels list is empty", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ hotels: [] }) }) // 1st
      .mockResolvedValueOnce({ ok: true, json: async () => ({ hotels: [] }) }) // 2nd
      .mockResolvedValueOnce({ ok: true, json: async () => ({ hotels: [{ id: "1" }] }) }); // 3rd

    global.fetch = mockFetch;

    const result = await fetchWithRetry("fake-url", 5, 0);
    expect(result.hotels.length).toBe(1); // After retries, final result has 1 hotel
    expect(mockFetch).toHaveBeenCalledTimes(3); // Retried 3 times, stop if non-empty
  });
});


