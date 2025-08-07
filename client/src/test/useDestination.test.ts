import {renderHook, waitFor, act} from '@testing-library/react';
import {useDestinations} from '../hooks/useDestinations';
import {expect, test, beforeAll, afterAll} from 'vitest';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
//unit test for useDestinations hook

//mock server/API setup
const server = setupServer(
  http.get('http://localhost:6039/api/destinations', ({ request }) => {
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search') ?? '';

    if (!searchQuery.trim()) {
      return HttpResponse.json([]);  // respond with [] for empty query
    }

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


/*test('handles empty search query gracefully', async () =>{
  const { result } = renderHook(() => useDestinations());

  await act(async ()=>{
    await result.current.searchDestinations('');
  });

  await waitFor(() =>{
    expect(result.current.destinations.length).toBeGreaterThan(0);
    expect(result.current.destinations.length).toBeLessThan(11);  //or default results
  });
});*/

test('returns no results for gibberish query', async () =>{
  server.use(
    http.get('http://localhost:6039/api/destinations', ()=>{
      return HttpResponse.json([]); //simulate no results
    })
  );

  const {result} = renderHook(() => useDestinations());

  await act(async () =>{
    await result.current.searchDestinations('asdlkfjsdlgkj');
  });

  await waitFor(() =>{
    expect(result.current.destinations).toEqual([]);
  });
});

test('handles API error gracefully', async () => {
  server.use(
    http.get('http://localhost:6039/api/destinations', () => {
      return HttpResponse.error(); // simulate server error
    })
  );

  const { result } = renderHook(() => useDestinations());

  await act(async () => {
    await result.current.searchDestinations('singapore');
  });

  await waitFor(() => {
    expect(result.current.destinations).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});


test('handles very long query input without crashing', async () => {
  const longQuery = 'a'.repeat(1000);

  server.use(
    http.get('http://localhost:6039/api/destinations', () => {
      return HttpResponse.json([]); // simulate empty results
    })
  );

  const { result } = renderHook(() => useDestinations());

  await act(async () => {
    await result.current.searchDestinations(longQuery);
  });

  await waitFor(() => {
    expect(result.current.destinations).toEqual([]);
  });
});

test('sets loading state correctly during fetch', async () => {
  let resolveFetch: any;
  const fetchPromise = new Promise((resolve) => { resolveFetch = resolve; });

  server.use(
    http.get('http://localhost:6039/api/destinations', () => {
      return fetchPromise.then(() => HttpResponse.json([]));
    })
  );

  const { result } = renderHook(() => useDestinations());

  act(() => {
    result.current.searchDestinations('delayed');
  });

  expect(result.current.loading).toBe(true);

  await act(async () => {
    resolveFetch();
  });

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
});