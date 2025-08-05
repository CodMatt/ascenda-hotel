import request from 'supertest';
import express from 'express';
import hotelsRouter from '../routes/hotels'; // Adjust path
import { describe, it, expect, vi } from 'vitest';

const app = express();
app.use('/api/hotels', hotelsRouter);

// Test suite for the GET /api/hotels/search endpoint
describe('GET /api/hotels/search', () => {

  // Test 1: Returns 400 error if required query params are missing
  it('returns 400 when query params are missing', async () => {
    const res = await request(app).get('/api/hotels/search'); // Request without query params, calling endpoint without ?destination_id for example.
    expect(res.status).toBe(400); 
  });

  // Test 2: All params val 
  it('returns hotel list when all params are valid', async () => {
    global.fetch = vi.fn()
      // 1) Mock hotel prices API response first
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          hotels: [{ id: '1', price: 100 }],
        }),
      })

      // 2) Mock hotel details API response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: '1',
           name: 'Hotel Test',
           address: 'SG',
           image_details: { prefix: '', suffix: '' } }
        ]),
      });

    // Get request, send query params
    const res = await request(app).get('/api/hotels/search')
      .query({
        destination_id: 'RsBU',
        checkin: '2025-12-01',
        checkout: '2025-12-07',
        guests: '2',
      });

    expect(res.status).toBe(200); // server resp
    expect(res.body.hotels).toHaveLength(1); // only 1 hotel since only have 1
    expect(res.body.hotels[0].name).toBe('Hotel Test'); // hotel name check
  });
});
