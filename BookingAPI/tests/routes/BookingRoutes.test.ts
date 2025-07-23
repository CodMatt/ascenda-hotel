import request from 'supertest';
import express from 'express';
import bookingRoutes from '../../src/routes/BookingRoutes';
import * as bookingRepo from '../../src/repos/bookingRepo';
import * as nonAccountRepo from '../../src/repos/nonAccountRepo';
import db from '../../src/models/db';

const app = express();
app.use(express.json());
app.use('/bookings', bookingRoutes);

describe('Booking Routes', () => {
  beforeAll(async () => {
    await bookingRepo.sync();
    await nonAccountRepo.sync();
  });

  describe('POST /bookings', () => {
    it('should create a new booking with account', async () => {
      const response = await request(app)
        .post('/bookings')
        .send({
          id: 'route-booking-1',
          dest_id: 'dest-1',
          hotel_id: 'hotel-1',
          start_date: '2023-01-01',
          end_date: '2023-01-04',
          user_ref: 'user-1'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('booking_id', 'route-booking-1');
    });

    it('should create a booking with non-account info', async () => {
      const response = await request(app)
        .post('/bookings')
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
          salutations: 'Mr'
        });

      expect(response.status).toBe(201);
      
      // Verify non-account info was saved
      const booking = await bookingRepo.getBookingById('route-booking-2');
      expect(booking).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/bookings')
        .send({
          id: 'invalid-booking'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /bookings', () => {
    it('should return all bookings', async () => {
      // Create test data
      await bookingRepo.createBooking({
        id: 'get-all-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(),
        created: new Date()
      } as any);

      const response = await request(app).get('/bookings');
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return a specific booking', async () => {
      const testBooking = {
        id: 'get-one-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(),
        created: new Date()
      };
      await bookingRepo.createBooking(testBooking as any);

      const response = await request(app).get('/bookings/get-one-1');
      expect(response.status).toBe(200);
      expect(response.body.booking_id).toBe('get-one-1');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app).get('/bookings/non-existent');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /bookings/:id', () => {
    it('should update a booking', async () => {
      const testBooking = {
        id: 'update-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(),
        created: new Date()
      };
      await bookingRepo.createBooking(testBooking as any);

      const response = await request(app)
        .put('/bookings/update-booking-1')
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

  describe('DELETE /bookings/:id', () => {
    it('should delete a booking', async () => {
      const testBooking = {
        id: 'delete-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(),
        created: new Date()
      };
      await bookingRepo.createBooking(testBooking as any);

      const response = await request(app)
        .delete('/bookings/delete-booking-1');

      expect(response.status).toBe(200);
      
      // Verify deletion
      const deletedBooking = await bookingRepo.getBookingById('delete-booking-1');
      expect(deletedBooking).toBeUndefined();
    });
  });
});