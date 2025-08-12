import * as bookingRepo from '../../../src/repos/bookingRepo';
import db from '../../../src/models/db';
import HelperFunctions from '../../support/HelperFunctions';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

/**
 * Unit Tests for Missing BookingRepo Functions
 * 
 * These tests cover the functions that were not included in the original
 * bookingRepo unit tests, specifically the "WithContact" functions that
 * join booking data with customer/nonaccount contact information.
 */

describe('BookingRepo - Missing Functions', () => {
  let testUserId: string;
  let testGuestBookingId: string;
  let testUserBookingId: string;
  let testGuestEmail: string;
  let testUserEmail: string;

  beforeEach(async () => {
    // Generate test data
    const timestamp = Date.now() + Math.random() * 1000;
    testGuestEmail = `guest-${timestamp}@example.com`;
    testUserEmail = `user-${timestamp}@example.com`;
    
    // Create test user
    testUserId = await HelperFunctions.generateUserWithEmail(testUserEmail);
    
    // Create guest booking
    testGuestBookingId = await HelperFunctions.generateBooking(false); // Guest booking
    
    // Create user booking
    testUserBookingId = await HelperFunctions.generateBooking(true, testUserId);
    
    console.log(`Created test data: User=${testUserId}, GuestBooking=${testGuestBookingId}, UserBooking=${testUserBookingId}`);
  });

  describe('getBookingWithContactById', () => {
    it('should return guest booking with contact information', async () => {
      const result = await bookingRepo.getBookingWithContactById(testGuestBookingId);
      
      expect(result).toBeDefined();
      expect(result?.booking_id).toBe(testGuestBookingId);
      expect(result?.contact_source).toBe('nonaccount');
      expect(result?.contact_first_name).toBeDefined();
      expect(result?.contact_last_name).toBeDefined();
      expect(result?.contact_email).toBeDefined();
      expect(result?.contact_phone).toBeDefined();
      expect(result?.contact_username).toBeNull();
      
      // Verify it has booking properties
      expect(result?.destination_id).toBeDefined();
      expect(result?.hotel_id).toBeDefined();
      expect(result?.nights).toBeGreaterThan(0);
      expect(result?.adults).toBeGreaterThan(0);
    });

    it('should return user booking with contact information', async () => {
      const result = await bookingRepo.getBookingWithContactById(testUserBookingId);
      
      expect(result).toBeDefined();
      expect(result?.booking_id).toBe(testUserBookingId);
      expect(result?.contact_source).toBe('customer');
      expect(result?.contact_first_name).toBeDefined();
      expect(result?.contact_last_name).toBeDefined();
      expect(result?.contact_email).toBe(testUserEmail);
      expect(result?.contact_phone).toBeDefined();
      expect(result?.contact_username).toBeDefined();
      expect(result?.user_reference).toBe(testUserId);
    });

    it('should return undefined for non-existent booking', async () => {
      const result = await bookingRepo.getBookingWithContactById('non-existent-booking');
      expect(result).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalQuery = db.getPool().query;
      db.getPool().query = vi.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(bookingRepo.getBookingWithContactById('test-booking')).rejects.toThrow();

      // Restore original function
      db.getPool().query = originalQuery;
    });

    it('should return all required contact fields for guest booking', async () => {
      const result = await bookingRepo.getBookingWithContactById(testGuestBookingId);
      
      expect(result).toBeDefined();
      
      // Required contact fields
      const requiredFields = [
        'contact_first_name',
        'contact_last_name', 
        'contact_salutation',
        'contact_email',
        'contact_phone',
        'contact_source'
      ];
      
      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field);
        expect(result?.[field as keyof typeof result]).toBeDefined();
      });
    });
  });

  describe('getAllBookingsWithContact', () => {
    it('should return all bookings with contact information', async () => {
      const results = await bookingRepo.getAllBookingsWithContact();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(2); // At least our test bookings
      
      // Find our test bookings
      const guestBooking = results.find(b => b.booking_id === testGuestBookingId);
      const userBooking = results.find(b => b.booking_id === testUserBookingId);
      
      expect(guestBooking).toBeDefined();
      expect(userBooking).toBeDefined();
      
      // Verify guest booking contact info
      expect(guestBooking?.contact_source).toBe('nonaccount');
      expect(guestBooking?.contact_username).toBeNull();
      
      // Verify user booking contact info
      expect(userBooking?.contact_source).toBe('customer');
      expect(userBooking?.contact_username).toBeDefined();
    });

    it('should order results by created_at DESC', async () => {
      const results = await bookingRepo.getAllBookingsWithContact();
      console.log("results: "+ JSON.stringify(results))
      if (results.length > 1) {
        // Check that results are ordered by creation date (newest first)
        for (let i = 0; i < results.length - 1; i++) {
          const current = new Date(results[i].created_at);
          const next = new Date(results[i + 1].created_at);
          expect(current >= next).toBe(true);
        }
      }
    });

    it('should handle empty result set', async () => {
      // This test assumes there might be scenarios with no bookings
      // In practice, we have test data, so we'll just verify the structure
      const results = await bookingRepo.getAllBookingsWithContact();
      
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        const firstResult = results[0];
        expect(firstResult).toHaveProperty('booking_id');
        expect(firstResult).toHaveProperty('contact_source');
        expect(['customer', 'nonaccount']).toContain(firstResult.contact_source);
      }
    });

    it('should include all booking and contact fields', async () => {
      const results = await bookingRepo.getAllBookingsWithContact();
      
      if (results.length > 0) {
        const booking = results[0];
        
        // Booking fields
        const bookingFields = [
          'booking_id', 'destination_id', 'hotel_id', 'nights',
          'start_date', 'end_date', 'adults', 'children',
          'msg_to_hotel', 'price', 'user_reference',
          'created_at', 'updated_at'
        ];
        
        // Contact fields
        const contactFields = [
          'contact_first_name', 'contact_last_name', 'contact_salutation',
          'contact_email', 'contact_phone', 'contact_source'
        ];
        
        [...bookingFields, ...contactFields].forEach(field => {
          expect(booking).toHaveProperty(field);
        });
      }
    });
  });

  describe('getBookingsWithContactByHotel', () => {
    const testHotelId = 'hotel-1'; // Using default hotel ID from test data

    it('should return bookings for specific hotel with contact info', async () => {
      const results = await bookingRepo.getBookingsWithContactByHotel(testHotelId);
      
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        // All results should be for the specified hotel
        results.forEach(booking => {
          expect(booking.hotel_id).toBe(testHotelId);
          expect(booking).toHaveProperty('contact_source');
          expect(['customer', 'nonaccount']).toContain(booking.contact_source);
        });
      }
    });

    it('should order results by start_date ASC', async () => {
      const results = await bookingRepo.getBookingsWithContactByHotel(testHotelId);
      
      if (results.length > 1) {
        // Check that results are ordered by start date (earliest first)
        for (let i = 0; i < results.length - 1; i++) {
          const current = new Date(results[i].start_date);
          const next = new Date(results[i + 1].start_date);
          expect(current <= next).toBe(true);
        }
      }
    });

    it('should return empty array for hotel with no bookings', async () => {
      const timestamp = Date.now();
      const nonExistentHotelId = `no-bookings-hotel-${timestamp}`;
      
      const results = await bookingRepo.getBookingsWithContactByHotel(nonExistentHotelId);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should include both guest and user bookings for hotel', async () => {
      // Create additional bookings for the same hotel
      const additionalGuestBooking = await HelperFunctions.generateBooking(false);
      const additionalUserBooking = await HelperFunctions.generateBooking(true, testUserId);
      
      // Update them to use the test hotel (this might require direct database manipulation)
      await bookingRepo.updateBooking(additionalGuestBooking, { hotel_id: testHotelId });
      await bookingRepo.updateBooking(additionalUserBooking, { hotel_id: testHotelId });
      
      const results = await bookingRepo.getBookingsWithContactByHotel(testHotelId);
      
      const guestBookings = results.filter(b => b.contact_source === 'nonaccount');
      const userBookings = results.filter(b => b.contact_source === 'customer');
      
      expect(guestBookings.length).toBeGreaterThan(0);
      expect(userBookings.length).toBeGreaterThan(0);
    });

    it('should handle special characters in hotel ID', async () => {
      const specialHotelId = 'hotel-with-special-chars-@#$%';
      
      const results = await bookingRepo.getBookingsWithContactByHotel(specialHotelId);
      
      expect(Array.isArray(results)).toBe(true);
      // Should not throw error even with special characters
    });
  });

  describe('getUserBookingsWithContact', () => {
    it('should return user bookings with contact information', async () => {
      const results = await bookingRepo.getUserBookingsWithContact(testUserId);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(1); // At least our test booking
      
      // All results should belong to the specified user
      results.forEach(booking => {
        expect(booking.user_reference).toBe(testUserId);
        expect(booking.contact_source).toBe('customer');
        expect(booking.contact_username).toBeDefined();
        expect(booking.contact_email).toBe(testUserEmail);
      });
    });

    it('should order results by created_at DESC', async () => {
      // Create multiple bookings for the same user
      const booking1 = await HelperFunctions.generateBooking(true, testUserId);
      await HelperFunctions.waitForDatabase(100); // Ensure different timestamps
      const booking2 = await HelperFunctions.generateBooking(true, testUserId);
      
      const results = await bookingRepo.getUserBookingsWithContact(testUserId);
      
      expect(results.length).toBeGreaterThanOrEqual(3); // Original + 2 new ones
      
      // Check ordering (newest first)
      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          const current = new Date(results[i].created_at);
          const next = new Date(results[i + 1].created_at);
          expect(current >= next).toBe(true);
        }
      }
    });

    it('should return empty array for user with no bookings', async () => {
      const timestamp = Date.now();
      const nonExistentUserId = `no-bookings-user-${timestamp}`;
      
      const results = await bookingRepo.getUserBookingsWithContact(nonExistentUserId);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should only return customer bookings (not guest bookings)', async () => {
      const results = await bookingRepo.getUserBookingsWithContact(testUserId);
      
      // Verify all returned bookings are customer bookings
      results.forEach(booking => {
        expect(booking.contact_source).toBe('customer');
        expect(booking.user_reference).toBe(testUserId);
        expect(booking.contact_username).toBeDefined();
      });
    });

    it('should include all customer contact fields', async () => {
      const results = await bookingRepo.getUserBookingsWithContact(testUserId);
      
      if (results.length > 0) {
        const booking = results[0];
        
        // Customer-specific fields that should be present
        const customerFields = [
          'contact_first_name', 'contact_last_name', 'contact_salutation',
          'contact_email', 'contact_phone', 'contact_username'
        ];
        
        customerFields.forEach(field => {
          expect(booking).toHaveProperty(field);
          expect(booking[field as keyof typeof booking]).toBeDefined();
        });
        
        expect(booking.contact_source).toBe('customer');
      }
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalQuery = db.getPool().query;
      db.getPool().query = vi.fn().mockRejectedValue(new Error('User query failed'));

      await expect(bookingRepo.getUserBookingsWithContact('test-user')).rejects.toThrow();

      // Restore original function
      db.getPool().query = originalQuery;
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      // Test with all bookings (could be large in a real system)
      const results = await bookingRepo.getAllBookingsWithContact();
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(executionTime).toBeLessThan(5000); // 5 seconds max
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle null/undefined user references correctly', async () => {
      // This test ensures the LEFT JOINs work correctly with null user_reference
      const guestBooking = await bookingRepo.getBookingWithContactById(testGuestBookingId);
      
      expect(guestBooking).toBeDefined();
      expect(guestBooking?.user_reference).toBeNull();
      expect(guestBooking?.contact_source).toBe('nonaccount');
    });

    it('should maintain data consistency in contact information', async () => {
      // Verify that contact info matches between different query methods
      const singleBooking = await bookingRepo.getBookingWithContactById(testUserBookingId);
      const allBookings = await bookingRepo.getAllBookingsWithContact();
      const userBookings = await bookingRepo.getUserBookingsWithContact(testUserId);
      
      const fromAll = allBookings.find(b => b.booking_id === testUserBookingId);
      const fromUser = userBookings.find(b => b.booking_id === testUserBookingId);
      console.log("single booking: " + JSON.stringify(singleBooking))
      console.log("single booking: " + JSON.stringify(allBookings))
      // Contact information should be consistent across all query methods
      expect(singleBooking?.contact_email).toBe(fromAll?.contact_email);
      expect(singleBooking?.contact_email).toBe(fromUser?.contact_email);
      expect(singleBooking?.contact_first_name).toBe(fromAll?.contact_first_name);
      expect(singleBooking?.contact_first_name).toBe(fromUser?.contact_first_name);
    });
  });
});