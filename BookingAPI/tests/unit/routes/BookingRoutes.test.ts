import request from 'supertest';
import express from 'express';
import bookingRoutes from '../../../src/routes/BookingRoutes';
import userRepo from '../../../src/repos/UserRepo';
import * as bookingRepo from '../../../src/repos/bookingRepo';
import * as nonAccountRepo from '../../../src/repos/nonAccountRepo';
import HelperFunctions from 'tests/support/HelperFunctions';
import { hashPassword } from '@src/common/util/auth';

const app = express();
app.use(express.json());
app.use('/booking', bookingRoutes);

// Helper function to format dates for MySQL
function formatDateForSQL(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\..+/, '');
}

describe('Booking Routes', () => {
  let testUserId: string;
  let authToken: string;
  let anotherUser: string;
  let anotherAuth: string;
  let testUserEmail: string;
  let anotherUserEmail: string;

  beforeEach(async () => {
    try {
      await bookingRepo.sync();
      await nonAccountRepo.sync();
      
      // Generate unique emails for this test run
      const timestamp = Date.now();
      testUserEmail = `test-${timestamp}@example.com`;
      anotherUserEmail = `another-${timestamp}@example.com`;
      
      // Create test user with unique email
      testUserId = await HelperFunctions.generateUserWithEmail(testUserEmail);
      authToken = await HelperFunctions.getAuthToken(testUserEmail, 'correctpass');
      
      // CRITICAL FIX: Get the userId from the JWT token
      const jwt = require('jsonwebtoken');
      const decoded = jwt.decode(authToken);
      const tokenUserId = decoded?.userId;
      
      if (tokenUserId && tokenUserId !== testUserId) {
        testUserId = tokenUserId; // Use the ID from token if different
      }
      
      console.log('Auth token userId:', testUserId);
      
      if (!testUserId) {
        throw new Error('No userId found in auth token');
      }

      // Create another user with unique email
      anotherUser = await HelperFunctions.generateUserWithEmail(anotherUserEmail);
      anotherAuth = await HelperFunctions.getAuthToken(anotherUserEmail, "correctpass");
      
    } catch (error) {
      console.log("beforeEach error: " + error);
      throw error;
    }
  });

  describe('POST /booking', () => {
    it('should create a new booking with valid account user', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 3); // 3 days after start
      
      const response = await request(app)
        .post('/booking')
        .send({
          id: 'route-booking-1',
          dest_id: 'dest-1',
          hotel_id: 'hotel-1',
          nights: 3,
          start_date: formatDateForSQL(futureDate),
          end_date: formatDateForSQL(endDate),
          adults: 2,
          children: 1,
          price: 299.99,
          user_ref: testUserId,
          msg_to_hotel: 'Late check-in please'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('booking_id', 'route-booking-1');
      expect(response.body.message).toBe('Booking created');
    });

    it('should create a booking with non-account info (guest booking)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 2);
      const timestamp = Date.now();

      const response = await request(app)
        .post('/booking')
        .send({
          id: 'route-booking-2',
          dest_id: 'dest-2',
          hotel_id: 'hotel-2',
          start_date: formatDateForSQL(futureDate),
          end_date: formatDateForSQL(endDate),
          nights: 2,
          adults: 1,
          children: 0,
          price: 150.00,
          user_ref: null, // Guest booking
          first_name: 'Guest',
          last_name: 'User',
          email: `guest-${timestamp}@example.com`,
          phone_num: '+1234567890',
          salutation: 'Mr'
        });

      expect(response.status).toBe(201);
      
      // Verify booking was created
      const booking = await bookingRepo.getBookingById('route-booking-2');
      
      expect(booking).toBeDefined();
      console.log(JSON.stringify(booking));
      expect(booking?.user_reference).toBeNull();
    });

    it('should fail with missing required booking fields', async () => {
      const response = await request(app)
        .post('/booking')
        .send({
          id: 'invalid-booking'
          // Missing dest_id, hotel_id, start_date, end_date
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should fail with missing guest details for non-account booking', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 2);

      const response = await request(app)
        .post('/booking')
        .send({
          dest_id: 'dest-3',
          hotel_id: 'hotel-3',
          start_date: formatDateForSQL(futureDate),
          end_date: formatDateForSQL(endDate),
          user_ref: null
          // Missing guest details: first_name, last_name, email, phone_num, salutation
        });

      expect(response.status).toBe(400);
      console.log("response status" + response.status);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate date constraints', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const response = await request(app)
        .post('/booking')
        .send({
          dest_id: 'dest-4',
          hotel_id: 'hotel-4',
          start_date: formatDateForSQL(pastDate), // Past date should fail
          end_date: formatDateForSQL(endDate),
          user_ref: testUserId
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /booking', () => {
    it('should return all bookings', async () => {
      // Create test booking data
      await bookingRepo.createBooking({
        id: 'get-all-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        created: new Date(),
        updated_at: new Date(),
        nights: 1,
        adults: 2,
        children: 0,
        price: 100,
        user_ref: testUserId,
        msg_to_hotel: ''
      } as any);

      const response = await request(app).get('/booking');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /booking/details/:id', () => {
    it('should return a specific booking by ID', async () => {
      const testBooking = {
        id: 'get-details-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created: new Date(),
        updated_at: new Date(),
        nights: 1,
        adults: 2,
        children: 0,
        price: 100,
        user_ref: testUserId,
        msg_to_hotel: ''
      };
      await bookingRepo.createBooking(testBooking as any);

      const response = await request(app).get('/booking/details/get-details-1');
      expect(response.status).toBe(200);
      console.log("Mystring: " + JSON.stringify(response.body));
      expect(response.body.booking_id).toBe('get-details-1');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app).get('/booking/details/non-existent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Booking not found');
    });
  });

  describe('PUT /booking/update/:id', () => {
    it('should update a booking with valid fields', async () => {
      const testBooking = {
        id: 'update-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created: new Date(),
        updated_at: new Date(),
        nights: 1,
        adults: 2,
        children: 0,
        price: 100,
        user_ref: testUserId,
        msg_to_hotel: ''
      };
      await bookingRepo.createBooking(testBooking as any);

      const response = await request(app)
        .put('/booking/update/update-booking-1')
        .send({
          nights: 5,
          adults: 3,
          price: 250.50
        });
      console.log(JSON.stringify(response));
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Booking updated');
      
      // Verify update
      const updatedBooking = await bookingRepo.getBookingById('update-booking-1');
      expect(updatedBooking?.nights).toBe(5);
      expect(updatedBooking?.adults).toBe(3);
      expect(updatedBooking?.price).toBe("250.50");
    });

    it('should fail with no valid fields to update', async () => {
      const response = await request(app)
        .put('/booking/update/some-id')
        .send({
          invalid_field: 'value'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No valid fields to update');
    });
  });

  // AUTHENTICATED ROUTES TESTS
  describe('GET /booking/my-booking (authenticated)', () => {
    it('should return user bookings when authenticated', async () => {
      // Create a booking for the test user
      const res = await bookingRepo.createBooking({
        id: 'user-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created: new Date(),
        updated_at: new Date(),
        nights: 1,
        adults: 1,
        children: 0,
        price: 100,
        user_ref: testUserId,
        msg_to_hotel: ''
      } as any);
      console.log("myres: " + JSON.stringify(res));

      const response = await request(app)
        .get('/booking/my-booking')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/booking/my-booking');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /booking/my-booking/:id (authenticated)', () => {
    it('should return specific user booking when authenticated', async () => {
      // Create booking properly with formatted dates
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 1);

      const bookingData = {
        id: 'user-booking-specific',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: formatDateForSQL(futureDate),
        end_date: formatDateForSQL(endDate),
        nights: 1,
        adults: 1,
        children: 0,
        price: 100,
        user_ref: testUserId,
        msg_to_hotel: ''
      };

      const res = await request(app)
        .post('/booking')
        .send(bookingData);

      expect(res.status).toBe(201);
      
      const response = await request(app)
        .get('/booking/my-booking/user-booking-specific')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.booking_id).toBe('user-booking-specific');
    });

    it('should return 404 for booking not owned by user', async () => {
      // Create booking for different user with proper date formatting
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 1);

      await bookingRepo.createBooking({
        id: 'other-user-booking',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: futureDate,
        end_date: endDate,
        created: new Date(),
        updated_at: new Date(),
        nights: 1,
        adults: 1,
        children: 0,
        price: 100,
        user_ref: testUserId,
        msg_to_hotel: ''
      } as any);

      const response = await request(app)
        .get('/booking/my-booking/other-user-booking')
        .set('Authorization', `Bearer ${anotherAuth}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Booking not found or not owned by user');
    });
  });

  describe('DELETE /booking/:id (authenticated)', () => {
    it('should delete a user booking when authenticated', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 1);

      const testBooking: any = {
        id: 'delete-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: futureDate,
        end_date: endDate,
        created: new Date(),
        updated_at: new Date(),
        nights: 1,
        adults: 2,
        children: 0,
        user_ref: testUserId, 
        price: 100,
        msg_to_hotel: ''
      };
      await bookingRepo.createBooking(testBooking);

      const response = await request(app)
        .delete('/booking/delete-booking-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Booking deleted');
      
      // Verify deletion
      const deletedBooking = await bookingRepo.getBookingById('delete-booking-1');
      expect(deletedBooking).toBeUndefined();
    });

    it('should fail to delete booking not owned by user', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 1);

      await bookingRepo.createBooking({
        id: 'other-user-delete-booking',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        start_date: futureDate,
        end_date: endDate,
        created: new Date(),
        updated_at: new Date(),
        nights: 1,
        adults: 1,
        children: 0,
        price: 100,
        user_ref: testUserId,
        msg_to_hotel: ''
      } as any);

      // Verify the booking was created correctly
      const verifyBooking = await bookingRepo.getBookingById('other-user-delete-booking');
      console.log('Booking user_reference:', verifyBooking?.user_reference);
      
      const response = await request(app)
        .delete('/booking/other-user-delete-booking')
        .set('Authorization', `Bearer ${anotherAuth}`);

      console.log('Response status:', response.status);
      console.log('Response body:', response.body);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not authorized to delete this booking');
    });
  });
});