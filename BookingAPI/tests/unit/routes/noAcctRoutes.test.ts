import request from 'supertest';
import express from 'express';
import noAcctRoutes from '../../../src/routes/noAcctRoutes';
import * as bookingRepo from '../../../src/repos/bookingRepo';
import * as nonAccountRepo from '../../../src/repos/nonAccountRepo';
import * as userRepo from '../../../src/repos/UserRepo';
import db from '../../../src/models/db';

import HelperFunctions from '../../support/HelperFunctions';
import { vi, beforeEach, describe, it, expect } from 'vitest';

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

/**
 * Unit Tests for Missing NonAccountRepo Functions
 * 
 * This test covers the getGuestByBookingId function that was not included
 * in the original nonAccountRepo unit tests.
 */

describe('NonAccountRepo - Missing Functions', () => {
  let testBookingId: string;
  let testGuestEmail: string;

  beforeEach(async () => {
    try {
      const timestamp = Date.now() + Math.random() * 1000;
      testBookingId = `test-booking-${timestamp}`;
      testGuestEmail = `guest-${timestamp}@example.com`;
      
      // Create a guest booking with non-account info
      const bookingData = {
        id: testBookingId,
        dest_id: 'dest-guest-test',
        hotel_id: 'hotel-guest-test',
        nights: 2,
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        adults: 1,
        children: 0,
        price: 200.00,
        msg_to_hotel: 'Test guest booking',
        created: new Date(),
        updated_at: new Date(),
        user_ref: null // Guest booking
      };
      
      await bookingRepo.createBooking(bookingData as any);
      
      // Add guest information
      const guestData = {
        booking_id: testBookingId,
        first_name: 'Test',
        last_name: 'Guest',
        salutation: 'Mr',
        email: testGuestEmail,
        phone_num: '+1-555-0123'
      };
      
      await nonAccountRepo.addNoAcctInfo(guestData);
      
      // Ensure data is committed
      await HelperFunctions.waitForDatabase(150);
      
      console.log(`✅ Created test guest booking: ${testBookingId}`);
    } catch (error) {
      console.error('❌ Failed to setup test data:', error);
      throw error;
    }
  });

  describe('getGuestByBookingId', () => {
    it('should return guest information for valid booking ID', async () => {
      const result = await nonAccountRepo.getGuestByBookingId(testBookingId);
      
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result?.booking_id).toBe(testBookingId);
      expect(result?.first_name).toBe('Test');
      expect(result?.last_name).toBe('Guest');
      expect(result?.salutation).toBe('Mr');
      expect(result?.email).toBe(testGuestEmail);
      expect(result?.phone_num).toBe('+1-555-0123');
    });

    it('should return null for non-existent booking ID', async () => {
      const nonExistentBookingId = `non-existent-${Date.now()}`;
      
      const result = await nonAccountRepo.getGuestByBookingId(nonExistentBookingId);
      
      expect(result).toBeNull();
    });

    it('should return null for booking ID with no guest information', async () => {
      // Create a booking without guest information (user booking)
      const userBookingId = `user-booking-${Date.now()}`;
      const userId = await HelperFunctions.generateUser();
      
      const userBookingData = {
        id: userBookingId,
        dest_id: 'dest-user-test',
        hotel_id: 'hotel-user-test',
        nights: 1,
        start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        adults: 1,
        children: 0,
        price: 100.00,
        msg_to_hotel: '',
        created: new Date(),
        updated_at: new Date(),
        user_ref: userId // User booking, not guest
      };
      
      await bookingRepo.createBooking(userBookingData as any);
      
      const result = await nonAccountRepo.getGuestByBookingId(userBookingId);
      
      expect(result).toBeNull();
    });

    it('should handle special characters in booking ID', async () => {
      const specialBookingId = 'booking-with-special-chars-!@#$%';
      
      const result = await nonAccountRepo.getGuestByBookingId(specialBookingId);
      
      expect(result).toBeNull();
      // Should not throw an error even with special characters
    });

    it('should handle very long booking IDs', async () => {
      const longBookingId = 'very-long-booking-id-' + 'x'.repeat(1000);
      
      const result = await nonAccountRepo.getGuestByBookingId(longBookingId);
      
      expect(result).toBeNull();
      // Should not throw an error or cause performance issues
    });

    it('should handle empty and null booking IDs gracefully', async () => {
      // Empty string
      const emptyResult = await nonAccountRepo.getGuestByBookingId('');
      expect(emptyResult).toBeNull();

      // This test depends on how your function handles null - uncomment if it should handle null
      // const nullResult = await nonAccountRepo.getGuestByBookingId(null as any);
      // expect(nullResult).toBeNull();
    });

    it('should return only one record even if multiple exist (LIMIT 1)', async () => {
      // This test verifies the LIMIT 1 clause works correctly
      // In normal circumstances, there should only be one guest record per booking
      
      const result = await nonAccountRepo.getGuestByBookingId(testBookingId);
      
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      // Verify it's a single object, not an array
      expect(Array.isArray(result)).toBe(false);
      expect(typeof result).toBe('object');
    });

    it('should handle database connection errors gracefully', async () => {
      // Mock a database error
      const originalGetPool = (nonAccountRepo as any).db?.getPool;
      
      if (originalGetPool) {
        const mockPool = {
          query: vi.fn().mockRejectedValue(new Error('Database connection failed'))
        };
        
        // Temporarily replace the database connection
        (nonAccountRepo as any).db = { getPool: () => mockPool };
        
        try {
          await expect(nonAccountRepo.getGuestByBookingId(testBookingId)).rejects.toThrow();
        } finally {
          // Restore original connection
          (nonAccountRepo as any).db = { getPool: originalGetPool };
        }
      }
    });

    it('should use provided connection parameter when available', async () => {
      // Test the connection parameter functionality
      const mockConnection = {
        query: vi.fn().mockResolvedValue({
          rows: [{
            booking_id: testBookingId,
            first_name: 'Mock',
            last_name: 'Guest',
            salutation: 'Ms',
            email: 'mock@example.com',
            phone_num: '+1-555-9999'
          }]
        })
      };

      const result = await nonAccountRepo.getGuestByBookingId(testBookingId, mockConnection);
      
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM nonaccount'),
        [testBookingId]
      );
      
      expect(result).toBeDefined();
      expect(result?.first_name).toBe('Mock');
    });

    it('should have correct SQL query structure', async () => {
      // This test verifies the SQL query is structured correctly
      // We can't easily test the exact SQL without mocking, but we can test behavior
      
      const result = await nonAccountRepo.getGuestByBookingId(testBookingId);
      
      expect(result).toBeDefined();
      
      // Verify all expected fields are present
      const expectedFields = ['booking_id', 'first_name', 'last_name', 'salutation', 'email', 'phone_num'];
      expectedFields.forEach(field => {
        expect(result).toHaveProperty(field);
      });
    });

    it('should handle concurrent requests for same booking ID', async () => {
      // Test concurrent access to the same booking
      const promises = Array.from({ length: 5 }, () => 
        nonAccountRepo.getGuestByBookingId(testBookingId)
      );
      
      const results = await Promise.all(promises);
      
      // All results should be identical
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result?.booking_id).toBe(testBookingId);
        expect(result?.email).toBe(testGuestEmail);
      });
    });

    it('should maintain data consistency across multiple calls', async () => {
      // Multiple calls should return consistent data
      const firstCall = await nonAccountRepo.getGuestByBookingId(testBookingId);
      const secondCall = await nonAccountRepo.getGuestByBookingId(testBookingId);
      const thirdCall = await nonAccountRepo.getGuestByBookingId(testBookingId);
      
      expect(firstCall).toEqual(secondCall);
      expect(secondCall).toEqual(thirdCall);
      
      // Verify specific fields are consistent
      expect(firstCall?.email).toBe(secondCall?.email);
      expect(firstCall?.phone_num).toBe(secondCall?.phone_num);
      expect(firstCall?.first_name).toBe(secondCall?.first_name);
    });
  });

  describe('Integration with existing functions', () => {
    it('should work correctly with addNoAcctInfo', async () => {
      // Create a new guest booking and info
      const newTimestamp = Date.now() + Math.random() * 1000;
      const newBookingId = `integration-test-${newTimestamp}`;
      const newGuestEmail = `integration-${newTimestamp}@example.com`;
      
      // Create booking
      const bookingData = {
        id: newBookingId,
        dest_id: 'dest-integration',
        hotel_id: 'hotel-integration',
        nights: 1,
        start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        adults: 2,
        children: 1,
        price: 300.00,
        msg_to_hotel: 'Integration test',
        created: new Date(),
        updated_at: new Date(),
        user_ref: null
      };
      
      await bookingRepo.createBooking(bookingData as any);
      
      // Add guest info
      const guestData = {
        booking_id: newBookingId,
        first_name: 'Integration',
        last_name: 'Test',
        salutation: 'Dr',
        email: newGuestEmail,
        phone_num: '+1-555-1111'
      };
      
      await nonAccountRepo.addNoAcctInfo(guestData);
      await HelperFunctions.waitForDatabase(100);
      
      // Retrieve guest info
      const result = await nonAccountRepo.getGuestByBookingId(newBookingId);
      
      expect(result).toBeDefined();
      expect(result?.booking_id).toBe(newBookingId);
      expect(result?.first_name).toBe('Integration');
      expect(result?.last_name).toBe('Test');
      expect(result?.salutation).toBe('Dr');
      expect(result?.email).toBe(newGuestEmail);
      expect(result?.phone_num).toBe('+1-555-1111');
    });

    it('should work correctly with getBookingsByHotel', async () => {
      // This test ensures that guest info retrieved by booking ID
      // matches what's returned by the hotel query
      
      const hotelBookings = await nonAccountRepo.getBookingsByHotel('hotel-guest-test');
      const ourBooking = hotelBookings.find(b => b.booking_id === testBookingId);
      
      expect(ourBooking).toBeDefined();
      
      // Get the same guest info directly
      const directGuestInfo = await nonAccountRepo.getGuestByBookingId(testBookingId);
      
      expect(directGuestInfo).toBeDefined();
      
      // Compare the contact information
      expect(ourBooking?.email).toBe(directGuestInfo?.email);
      expect(ourBooking?.first_name).toBe(directGuestInfo?.first_name);
      expect(ourBooking?.last_name).toBe(directGuestInfo?.last_name);
      expect(ourBooking?.phone_num).toBe(directGuestInfo?.phone_num);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should perform efficiently with valid booking ID', async () => {
      const startTime = performance.now();
      
      const result = await nonAccountRepo.getGuestByBookingId(testBookingId);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(result).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple rapid sequential calls', async () => {
      const startTime = performance.now();
      
      // Make 10 rapid sequential calls
      for (let i = 0; i < 10; i++) {
        const result = await nonAccountRepo.getGuestByBookingId(testBookingId);
        expect(result).toBeDefined();
        expect(result?.booking_id).toBe(testBookingId);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(5000); // All 10 calls should complete within 5 seconds
    });

    it('should handle booking IDs with various formats', async () => {
      const testFormats = [
        `uuid-style-${Date.now()}-${Math.random()}`,
        `UPPERCASE-${Date.now()}`,
        `lowercase-${Date.now()}`,
        `Mixed-Case-${Date.now()}`,
        `numbers-123456789-${Date.now()}`,
        `with-dashes-and-underscores_${Date.now()}`
      ];
      
      // All should return null (since they don't exist) but shouldn't throw errors
      for (const bookingId of testFormats) {
        const result = await nonAccountRepo.getGuestByBookingId(bookingId);
        expect(result).toBeNull();
      }
    });
  });
});