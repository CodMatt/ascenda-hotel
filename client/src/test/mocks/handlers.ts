//mock backend
import {http, HttpResponse} from 'msw';

export const handlers = [
    http.get('/api/destinations', () =>{
        return HttpResponse.json([{term: 'Singapore, Singapore', uid: 'RsBU'},
            {term: 'New York, NY, United States', uid:'jiHz'},
            {term: 'Tokyo, Japan', uid:'fRZM'}]);
    }),

    http.get("/api/search", () => {
        return HttpResponse.json({
          hotels: [
            { id: "H1", name: "Marina Bay Sands", price: { amount: 321.5 }, rating: 5 },
            { id: "H2", name: "Pan Pacific", price: { amount: 150 }, rating: 5 },
          ],
        });
      }),
];