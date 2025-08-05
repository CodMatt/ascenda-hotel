import {renderHook, waitFor, act} from '@testing-library/react';
import {useDestinations} from '../hooks/useDestinations';
import {expect, vi, test, beforeAll, afterAll} from 'vitest';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
//unit test for useDestinations hook

//mock server/API setup
const server = setupServer(
    http.get('http://localhost:4000/api/destinations', ({ request }) => {
        return HttpResponse.json([
          { term: 'Singapore, Singapore', uid: 'RsBU' },
          { term: 'New York, NY, United States', uid: 'jiHz' },
          { term: 'Tokyo, Japan', uid: 'fRZM' }
        ]);
    })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

test('fetches destinations', async () => {
  const { result } = renderHook(() => useDestinations());

  await act(async () => {
    await result.current.searchDestinations('singapore');
  });


  await waitFor(() => {
    expect(result.current.destinations.length).toBeGreaterThan(0);
    expect(result.current.destinations[0].term).toBe('Singapore, Singapore');
  });
});
