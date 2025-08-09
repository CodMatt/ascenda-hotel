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
  let testUserId: string;

  beforeAll(async () => {
    await nonAccountRepo.sync();
    await bookingRepo.sync();
    
    const timestamp = Date.now();
    testUserId = `user-${timestamp}`;
    const uniqueEmail = `test-${timestamp}@example.com`;
    
    await userRepo.add({
      id: testUserId,
      username: 'testuser',
      password: 'hashedpass',
      email: uniqueEmail,
      phone_num: '1234567890',
      created: new Date()
    } as any);
  });

  describe('GET /non-account/:HotelId', () => {
    it('should return bookings for a hotel', async () => {
      const timestamp = Date.now();
      const hotelId = `test-hotel-route-${timestamp}`;
      
      // Create test data
      const booking1 = {
        id: `hotel-booking-route-1-${timestamp}`,
        hotel_id: hotelId,
        dest_id: 'dest-1',
        nights: 3,
        adults: 2,
        price: 0,
        start_date: new Date(),
        end_date: new Date(),
        created: new Date(),
        updated_at: new Date(),
        msg_to_hotel: '',
        user_ref: testUserId
      };
      
      const booking2 = {
        id: `hotel-booking-route-2-${timestamp}`,
        hotel_id: hotelId,
        dest_id: 'dest-1',
        nights: 2,
        adults: 2,
        price: 0,
        start_date: new Date(),
        end_date: new Date(),
        created: new Date(),
        updated_at: new Date(),
        msg_to_hotel: '',
        user_ref: null // Guest booking
      };

      await bookingRepo.createBooking(booking1 as any);
      await bookingRepo.createBooking(booking2 as any);

      // Add non-account info for booking2
      await nonAccountRepo.addNoAcctInfo({
        booking_id: `hotel-booking-route-2-${timestamp}`,
        first_name: 'Guest',
        last_name: 'User',
        salutation: 'Mr',
        email: `guest-${timestamp}@example.com`,
        phone_num: '1234567890'
      });

      const response = await request(app).get(`/non-account/${hotelId}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.some((b: any) => b.booking_id === `hotel-booking-route-1-${timestamp}`)).toBe(true);
      expect(response.body.some((b: any) => b.booking_id === `hotel-booking-route-2-${timestamp}`)).toBe(true);
    });

    it('should return empty array for hotel with no bookings', async () => {
      const timestamp = Date.now();
      const response = await request(app).get(`/non-account/no-bookings-hotel-${timestamp}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});