// tests/unit/models/bookingWithContact.test.ts

import bookingWithContact from '../../../src/models/bookingWContact';
import booking from '../../../src/models/booking';

describe('BookingWithContact Model', () => {
  describe('new', () => {
    it('should create a new bookingWithContact with default values', () => {
      const newBookingWithContact = bookingWithContact.new();
      
      expect(newBookingWithContact).toMatchObject({
        // Inherited booking properties
        id: '',
        dest_id: '',
        hotel_id: '',
        nights: 0,
        adults: 0,
        children: 0,
        msg_to_hotel: '',
        user_ref: null,
        price: 0,
        
        // Contact information properties
        contact_first_name: '',
        contact_last_name: '',
        contact_salutation: '',
        contact_email: '',
        contact_phone: '',
        contact_username: null,
        contact_source: 'nonaccount'
      });
      
      // Check date properties
      expect(newBookingWithContact.start_date).toBeInstanceOf(Date);
      expect(newBookingWithContact.end_date).toBeInstanceOf(Date);
      expect(newBookingWithContact.created).toBeInstanceOf(Date);
      expect(newBookingWithContact.updated_at).toBeInstanceOf(Date);
    });

    it('should create a bookingWithContact with provided values', () => {
      const testDate = new Date('2024-01-01');
      const customBookingWithContact = bookingWithContact.new({
        id: 'test-booking-123',
        dest_id: 'paris-001',
        hotel_id: 'ritz-paris',
        nights: 3,
        start_date: testDate,
        end_date: testDate,
        adults: 2,
        children: 1,
        price: 500.00,
        user_ref: 'user-123',
        
        // Contact information
        contact_first_name: 'John',
        contact_last_name: 'Doe',
        contact_salutation: 'Mr',
        contact_email: 'john.doe@example.com',
        contact_phone: '+1-555-0123',
        contact_username: 'johndoe',
        contact_source: 'customer'
      });

      expect(customBookingWithContact).toMatchObject({
        id: 'test-booking-123',
        dest_id: 'paris-001',
        hotel_id: 'ritz-paris',
        nights: 3,
        start_date: testDate,
        end_date: testDate,
        adults: 2,
        children: 1,
        price: 500.00,
        user_ref: 'user-123',
        contact_first_name: 'John',
        contact_last_name: 'Doe',
        contact_salutation: 'Mr',
        contact_email: 'john.doe@example.com',
        contact_phone: '+1-555-0123',
        contact_username: 'johndoe',
        contact_source: 'customer'
      });
    });

    it('should throw error for invalid contact_source', () => {
      expect(() => bookingWithContact.new({ 
        contact_source: 'invalid_source' as any 
      })).toThrow();
    });

    it('should throw error for invalid data types', () => {
      expect(() => bookingWithContact.new({ 
        contact_first_name: 123 as any 
      })).toThrow();
      
      expect(() => bookingWithContact.new({ 
        contact_email: 123 as any 
      })).toThrow();
      
      expect(() => bookingWithContact.new({ 
        nights: 'invalid' as any 
      })).toThrow();
    });
  });

  describe('test', () => {
    it('should validate correct bookingWithContact object', () => {
      const validBookingWithContact = bookingWithContact.new();
      expect(bookingWithContact.test(validBookingWithContact)).toBe(true);
    });

    it('should reject invalid bookingWithContact object', () => {
      expect(bookingWithContact.test({})).toBe(false);
      expect(bookingWithContact.test({ id: 123 })).toBe(false);
      expect(bookingWithContact.test({ contact_source: 'invalid' })).toBe(false);
    });

    it('should call error callback for invalid objects', () => {
      const mockErrorCb = vi.fn();
      bookingWithContact.test({}, mockErrorCb);
      expect(mockErrorCb).toHaveBeenCalled();
    });
  });

  describe('fromBookingAndContact', () => {
    it('should convert booking and customer contact info to bookingWithContact', () => {
      const testBooking = booking.new({
        id: 'booking-456',
        dest_id: 'tokyo-001',
        hotel_id: 'tokyo-hilton',
        nights: 2,
        adults: 1,
        price: 300.00
      });

      const customerContactInfo = {
        first_name: 'Jane',
        last_name: 'Smith',
        salutation: 'Ms',
        email: 'jane.smith@example.com',
        phone_num: '+1-555-0456',
        username: 'janesmith'
      };

      const result = bookingWithContact.fromBookingAndContact(
        testBooking,
        customerContactInfo,
        'customer'
      );

      expect(result).toMatchObject({
        // Original booking data
        id: 'booking-456',
        dest_id: 'tokyo-001',
        hotel_id: 'tokyo-hilton',
        nights: 2,
        adults: 1,
        price: 300.00,
        
        // Contact information
        contact_first_name: 'Jane',
        contact_last_name: 'Smith',
        contact_salutation: 'Ms',
        contact_email: 'jane.smith@example.com',
        contact_phone: '+1-555-0456',
        contact_username: 'janesmith',
        contact_source: 'customer'
      });
    });

    it('should convert booking and guest contact info to bookingWithContact', () => {
      const testBooking = booking.new({
        id: 'guest-booking-789',
        dest_id: 'london-001',
        hotel_id: 'london-savoy',
        nights: 4,
        adults: 2,
        price: 800.00,
        user_ref: null
      });

      const guestContactInfo = {
        first_name: 'Bob',
        last_name: 'Johnson',
        salutation: 'Dr',
        email: 'bob.johnson@example.com',
        phone_num: '+1-555-0789'
        // Note: no username for guest
      };

      const result = bookingWithContact.fromBookingAndContact(
        testBooking,
        guestContactInfo,
        'nonaccount'
      );

      expect(result).toMatchObject({
        id: 'guest-booking-789',
        dest_id: 'london-001',
        hotel_id: 'london-savoy',
        nights: 4,
        adults: 2,
        price: 800.00,
        user_ref: null,
        contact_first_name: 'Bob',
        contact_last_name: 'Johnson',
        contact_salutation: 'Dr',
        contact_email: 'bob.johnson@example.com',
        contact_phone: '+1-555-0789',
        contact_username: null,
        contact_source: 'nonaccount'
      });
    });

    it('should handle missing username in contact info', () => {
      const testBooking = booking.new({
        id: 'booking-no-username',
        dest_id: 'test-dest',
        hotel_id: 'test-hotel'
      });

      const contactInfoWithoutUsername = {
        first_name: 'Test',
        last_name: 'User',
        salutation: 'Mr',
        email: 'test@example.com',
        phone_num: '+1-555-0000'
        // No username property
      };

      const result = bookingWithContact.fromBookingAndContact(
        testBooking,
        contactInfoWithoutUsername,
        'customer'
      );

      expect(result.contact_username).toBeNull();
      expect(result.contact_source).toBe('customer');
    });
  });

  describe('toBooking', () => {
    it('should extract booking data from bookingWithContact', () => {
      const testBookingWithContact = bookingWithContact.new({
        id: 'extract-test-123',
        dest_id: 'extract-dest',
        hotel_id: 'extract-hotel',
        nights: 3,
        adults: 2,
        children: 1,
        price: 400.00,
        user_ref: 'user-456',
        msg_to_hotel: 'Test message',
        
        // Contact info that should be stripped
        contact_first_name: 'Should',
        contact_last_name: 'BeRemoved',
        contact_salutation: 'Mr',
        contact_email: 'removed@example.com',
        contact_phone: '+1-555-9999',
        contact_username: 'removed',
        contact_source: 'customer'
      });

      const extractedBooking = bookingWithContact.toBooking(testBookingWithContact);

      // Should have all booking properties
      expect(extractedBooking).toMatchObject({
        id: 'extract-test-123',
        dest_id: 'extract-dest',
        hotel_id: 'extract-hotel',
        nights: 3,
        adults: 2,
        children: 1,
        price: 400.00,
        user_ref: 'user-456',
        msg_to_hotel: 'Test message'
      });

      // Should NOT have contact properties
      expect(extractedBooking).not.toHaveProperty('contact_first_name');
      expect(extractedBooking).not.toHaveProperty('contact_last_name');
      expect(extractedBooking).not.toHaveProperty('contact_salutation');
      expect(extractedBooking).not.toHaveProperty('contact_email');
      expect(extractedBooking).not.toHaveProperty('contact_phone');
      expect(extractedBooking).not.toHaveProperty('contact_username');
      expect(extractedBooking).not.toHaveProperty('contact_source');

      // Should be a valid booking object
      expect(booking.test(extractedBooking)).toBe(true);
    });

    it('should preserve date objects when extracting booking', () => {
      const testDate = new Date('2024-06-15');
      const testBookingWithContact = bookingWithContact.new({
        id: 'date-test',
        start_date: testDate,
        end_date: testDate,
        created: testDate,
        updated_at: testDate
      });

      const extractedBooking = bookingWithContact.toBooking(testBookingWithContact);

      expect(extractedBooking.start_date).toEqual(testDate);
      expect(extractedBooking.end_date).toEqual(testDate);
      expect(extractedBooking.created).toEqual(testDate);
      expect(extractedBooking.updated_at).toEqual(testDate);
    });
  });

  describe('Integration with base Booking model', () => {
    it('should be compatible with base booking validation', () => {
      const baseBooking = booking.new({
        id: 'compatibility-test',
        dest_id: 'test-dest',
        hotel_id: 'test-hotel',
        nights: 2,
        adults: 1,
        price: 200.00
      });

      const bookingWithContactFromBase = bookingWithContact.fromBookingAndContact(
        baseBooking,
        {
          first_name: 'Compatible',
          last_name: 'Test',
          salutation: 'Mr',
          email: 'compatible@example.com',
          phone_num: '+1-555-0000'
        },
        'nonaccount'
      );

      // Should pass bookingWithContact validation
      expect(bookingWithContact.test(bookingWithContactFromBase)).toBe(true);

      // Extracted booking should pass base booking validation
      const extractedBooking = bookingWithContact.toBooking(bookingWithContactFromBase);
      expect(booking.test(extractedBooking)).toBe(true);
    });
  });
});