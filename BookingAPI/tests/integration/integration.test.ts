import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { hashPassword } from '@src/common/util/auth';
import HelperFunctions from '../support/HelperFunctions';
import db from '@src/models/db';

// Import all route modules
import bookingRoutes from '@src/routes/BookingRoutes';
import emailRoutes from '@src/routes/EmailRoutes';
import noAcctRoutes from '@src/routes/noAcctRoutes';
import UserRoutes from '@src/routes/UserRoutes';



// Create test app
const app = express();
app.use(express.json());
app.use('/booking', bookingRoutes);
app.use('/api/email', emailRoutes);
app.use('/non-account', noAcctRoutes);
app.use('/users', UserRoutes);

// Mock the emailService at the top level using a factory function
vi.mock('@src/services/emailService', () => {
  // Use a let variable that can be updated later
  let guestBookingId: string;
  let guestEmail: string;

  return {
    emailService: {
      sendBookingAccessEmail: vi.fn().mockImplementation((bookingId, email) => {
        guestBookingId = bookingId;
        guestEmail = email;
        return Promise.resolve({
          success: true,
          message: 'Email sent',
          accessToken: 'mock-token'
        });
      }),
      verifyGuestAccessToken: vi.fn().mockImplementation(() => {
        return Promise.resolve({
          valid: true,
          bookingId: guestBookingId,
          email: guestEmail
        });
      }),
      markTokenAsUsed: vi.fn()
    },
    // Expose setters for test control
    __setGuestData: (id: string, email: string) => {
      guestBookingId = id;
      guestEmail = email;
    }
  };
});

describe('Full System Integration Tests', () => {
  let testUserId: string;
  let authToken: string;
  let testBookingId: string;

  beforeEach(async () => {
    // Create test user
    const timestamp = Date.now();
    testUserId = await HelperFunctions.generateUserWithEmail(`int-test-${timestamp}@example.com`);
    authToken = await HelperFunctions.getAuthToken(`int-test-${timestamp}@example.com`, 'correctpass');
  });

  describe('User Journey: Create Account -> Make Booking -> Manage Booking', () => {
    it('should complete full user journey successfully', async () => {
      // 1. Verify user exists
      const userResponse = await request(app)
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(userResponse.status).toBe(200);
      expect(userResponse.body.id).toBe(testUserId);

      // 2. Create a booking
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 3);

      const bookingResponse = await request(app)
        .post('/booking')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: 'int-test-booking',
          dest_id: 'dest-1',
          hotel_id: 'hotel-1',
          nights: 3,
          start_date: futureDate.toISOString(),
          end_date: endDate.toISOString(),
          adults: 2,
          children: 1,
          price: 299.99,
          user_ref: testUserId,
          msg_to_hotel: 'Integration test booking'
        });

      expect(bookingResponse.status).toBe(201);
      testBookingId = bookingResponse.body.booking_id;

      // 3. Verify booking exists
      const getBookingResponse = await request(app)
        .get(`/booking/details/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getBookingResponse.status).toBe(200);
      expect(getBookingResponse.body.booking_id).toBe(testBookingId);

      // 4. Update booking
      const updateResponse = await request(app)
        .put(`/booking/update/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          adults: 3,
          children: 2
        });

      expect(updateResponse.status).toBe(200);

      // 5. Verify update
      const updatedBooking = await request(app)
        .get(`/booking/details/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(updatedBooking.body.adults).toBe(3);
      expect(updatedBooking.body.children).toBe(2);

      // 6. Delete booking
      const deleteResponse = await request(app)
        .delete(`/booking/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // 7. Verify deletion
      const deletedBookingResponse = await request(app)
        .get(`/booking/details/${testBookingId}`);

      expect(deletedBookingResponse.status).toBe(404);
    });
  });

  describe('Guest Booking Journey', () => {
    it('should allow guest booking and access via email', async () => {
      // 1. Create guest booking
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 2);
      const timestamp = Date.now();
      const guestEmail = `guest-${timestamp}@example.com`;

      const bookingResponse = await request(app)
        .post('/booking')
        .send({
          id: 'guest-booking-int',
          dest_id: 'dest-2',
          hotel_id: 'hotel-2',
          start_date: futureDate.toISOString(),
          end_date: endDate.toISOString(),
          nights: 2,
          adults: 1,
          children: 0,
          price: 150.00,
          user_ref: null,
          first_name: 'Guest',
          last_name: 'User',
          email: guestEmail,
          phone_num: '+1234567890',
          salutation: 'Mr'
        });

      expect(bookingResponse.status).toBe(201);
      const guestBookingId = bookingResponse.body.booking_id;

      // 2. Send booking access email
      const emailResponse = await request(app)
        .post('/api/email/send-booking-access')
        .send({
          booking_id: guestBookingId,
          email: guestEmail
        });

      expect(emailResponse.status).toBe(200);

      

      // 3. Access booking with token
      const accessResponse = await request(app)
        .get(`/api/email/guest-booking/mock-token`);

      expect(accessResponse.status).toBe(200);
      expect(accessResponse.body.booking.booking_id).toBe(guestBookingId);
    });
  });

  describe('Cross-Module Integration', () => {
    it('should maintain data consistency across user and booking modules', async () => {
      // 1. Create user
      const timestamp = Date.now();
      const userEmail = `cross-mod-${timestamp}@example.com`;
      const userId = await HelperFunctions.generateUserWithEmail(userEmail);
      const userToken = await HelperFunctions.getAuthToken(userEmail, 'correctpass');

      // 2. Create booking
      const bookingResponse = await request(app)
        .post('/booking')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          id: 'cross-mod-booking',
          dest_id: 'dest-1',
          hotel_id: 'hotel-1',
          nights: 1,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 86400000).toISOString(),
          adults: 1,
          children: 0,
          price: 100,
          user_ref: userId,
          msg_to_hotel: ''
        });

      expect(bookingResponse.status).toBe(201);
      const bookingId = bookingResponse.body.booking_id;

      // 3. Verify user bookings endpoint
      const userBookingsResponse = await request(app)
        .get('/booking/my-booking')
        .set('Authorization', `Bearer ${userToken}`);

      expect(userBookingsResponse.status).toBe(200);
      expect(userBookingsResponse.body.some((b: any) => b.booking_id === bookingId)).toBe(true);

      // 4. Verify hotel bookings endpoint
      const hotelBookingsResponse = await request(app)
        .get('/non-account/hotel-1');

      expect(hotelBookingsResponse.status).toBe(200);
      expect(hotelBookingsResponse.body.some((b: any) => b.booking_id === bookingId)).toBe(true);

      // 5. Delete user and verify booking is orphaned
      const deleteUserResponse = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(deleteUserResponse.status).toBe(200);

      // Verify booking still exists but user_ref is null
      const bookingDetails = await request(app)
        .get(`/booking/details/${bookingId}`);

      expect(bookingDetails.status).toBe(200);
      expect(bookingDetails.body.user_reference).toBeNull();
    });
  });
});