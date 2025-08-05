//mock backend
import {http, HttpResponse} from 'msw';

export const handlers = [
    http.get('/api/destinations', () =>{
        return HttpResponse.json([{term: 'Singapore, Singapore', uid: 'RsBU'},
            {term: 'New York, NY, United States', uid:'jiHz'},
            {term: 'Tokyo, Japan', uid:'fRZM'}]);
    }),
];