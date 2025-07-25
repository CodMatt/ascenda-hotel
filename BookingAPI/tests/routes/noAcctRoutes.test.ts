import request from 'supertest';
import express from 'express';
import noAcctRoutes from '../../src/routes/noAcctRoutes';
import * as bookingRepo from '../../src/repos/bookingRepo';
import * as nonAccountRepo from '../../src/repos/nonAccountRepo';
import * as userRepo from '../../src/repos/UserRepo';

import db from '../../src/models/db';

const app = express();
app.use(express.json());
app.use('/non-account', noAcctRoutes);

describe('NonAcct Routes', () => {
  beforeAll(async () => {
    await nonAccountRepo.sync();
    await bookingRepo.sync();
    await userRepo.add({
      id: "user-1",
      username: 'testuser',
      password: 'hashedpass',
      email: 'test@example.com',
      phone_num: '1234567890',
      created: new Date()
    } as any);
    
  });

  describe('GET /non-account/:HotelId', () => {
    it('should return bookings for a hotel', async () => {
      // Create test data
      const booking1 = {
        id: 'hotel-booking-route-1',
        hotel_id: 'test-hotel-route',
        nights: 3,
        adults:2,
        price:0,
        start_date: new Date(),
        end_date: new Date(),
        created: new Date(),
        user_ref: 'user-1'
      };
      const booking2 = {
        id: 'hotel-booking-route-2',
        hotel_id: 'test-hotel-route',
        nights:2,
        adults:2,
        price:0,
        start_date: new Date(),
        end_date: new Date(),
        created: new Date()
      };
      await bookingRepo.createBooking(booking1 as any);
      await bookingRepo.createBooking(booking2 as any);

      // Add non-account info for booking2
      await nonAccountRepo.addNoAcctInfo({
        booking_id: 'hotel-booking-route-2',
        first_name: 'Guest',
        last_name: 'User',
        salutation: 'Mr',
        email: 'guest@example.com',
        phone_num: '1234567890'
      });

      const response = await request(app).get('/non-account/test-hotel-route');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.some((b: any) => b.booking_id === 'hotel-booking-route-1')).toBe(true);
      expect(response.body.some((b: any) => b.booking_id === 'hotel-booking-route-2')).toBe(true);
    });

    it('should return empty array for hotel with no bookings', async () => {
      const response = await request(app).get('/non-account/no-bookings-hotel');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});