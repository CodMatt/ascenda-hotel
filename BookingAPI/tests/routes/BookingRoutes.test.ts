import request from 'supertest';
import express from 'express';
import bookingRoutes from '../../src/routes/BookingRoutes';
import * as bookingRepo from '../../src/repos/bookingRepo';
import * as nonAccountRepo from '../../src/repos/nonAccountRepo';
import * as userRepo from '../../src/repos/UserRepo';

import { getAuthToken } from './UserRoutes.test';
import { hashPassword } from '../../src/common/util/auth';


const app = express();
app.use(express.json());
app.use('/booking', bookingRoutes);

describe('Booking Routes', () => {
  let testUserId: String;
  beforeEach(async () => {
    await bookingRepo.sync();
    await nonAccountRepo.sync();
    testUserId = 'test-user-' + Date.now();
    const hashedPassword = await hashPassword('correctpass');
    
    await userRepo.add({
      id: testUserId,
      username: 'testuser',
      password: hashedPassword,
      email: 'test@example.com',
      phone_num: '1234567890',
      created: new Date()
    } as any);
  });
  describe('POST /booking', () => {
    it('should create a new booking with account', async () => {
    const response = await request(app)
      .post('/booking')
      .send({
        id: 'route-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 1, // Required
        start_date: '2023-01-01',
        end_date: '2023-01-04',
        adults: 1, // Required
        children: 0,
        price: 100, // Required
        user_ref: testUserId,
        msg_to_hotel: '', // Required string field
      });
      console.log("response: "+ response.error);
    expect(response.status).toBe(201);
    });

    it('should create a booking with non-account info', async () => {
      const response = await request(app)
        .post('/booking')
        .send({
          id: 'route-booking-2',
          dest_id: 'dest-2',
          hotel_id: 'hotel-2',
          start_date: '2023-01-01',
          end_date: '2023-01-04',
          first_name: 'Guest',
          last_name: 'User',
          email: 'guest@example.com',
          phone_num: '1234567890',
          salutation: 'Mr'
        });

      expect(response.status).toBe(201);
      
      // Verify non-account info was saved
      const booking = await bookingRepo.getBookingById('route-booking-2');
      expect(booking).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/booking')
        .send({
          id: 'invalid-booking'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /booking', () => {
    it('should return all bookings', async () => {
      // Create test data
      await bookingRepo.createBooking({
        id: 'get-all-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(),
        created: new Date(),
        nights: 1,
        adults: 2,
        children: 0,
        price: 100,
        msg_to_hotel: ''
      } as any);


      const response = await request(app).get('/booking');
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /booking/:id', () => {
    it('should return a specific booking', async () => {
      const testBooking = {
        id: 'get-one-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(),
        created: new Date(),
        nights: 1,
        adults: 2,
        children: 0,
        price: 100,
        msg_to_hotel: ''
      };
      await bookingRepo.createBooking(testBooking as any);

      const response = await request(app).get('/booking/get-one-1');
      expect(response.status).toBe(200);
      expect(response.body.booking_id).toBe('get-one-1');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app).get('/booking/non-existent');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /booking/:id', () => {
    it('should update a booking', async () => {
      const testBooking = {
        id: 'update-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(),
        created: new Date(),
        nights: 1,
        adults: 2,
        children: 0,
        price: 100,
        msg_to_hotel: ''
      };
      await bookingRepo.createBooking(testBooking as any);

      const response = await request(app)
        .put('/booking/update-booking-1')
        .send({
          nights: 5,
          adults: 3
        });

      expect(response.status).toBe(200);
      
      // Verify update
      const updatedBooking = await bookingRepo.getBookingById('update-booking-1');
      expect(updatedBooking?.nights).toBe(5);
      expect(updatedBooking?.adults).toBe(3);
    });
  });

  describe('DELETE /booking/:id', () => {

    it('should delete a booking', async () => {
      const testBooking:any = {
        id: 'delete-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(),
        created: new Date(),
        nights: 1,
        adults: 2,
        children: 0,
        user_ref:testUserId,
        price: 100,

        msg_to_hotel: ''
      };
      await bookingRepo.createBooking(testBooking);
      const token = await getAuthToken('test@example.com', 'correctpass');
          const response = await request(app)
            .delete('/booking/delete-booking-1')
            .set('Authorization', `Bearer ${token}`);

      // const response = await request(app)
      //   .delete('/booking/delete-booking-1');
      expect(response.status).toBe(200);
      
      // Verify deletion
      const deletedBooking = await bookingRepo.getBookingById('delete-booking-1');
      expect(deletedBooking).toBeUndefined();
    });
  });
});