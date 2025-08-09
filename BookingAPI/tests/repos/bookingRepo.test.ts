import * as bookingRepo from '../../src/repos/bookingRepo';
import booking from '../../src/models/booking';
import HelperFunctions from 'tests/support/HelperFunctions';

describe('Booking Repository', () => {
  // 1. Declare ALL test variables at the top
  
  // common variables used
  let testUserId: string;
  let start_date = new Date("1995-12-17T00:00:00");
  let end_date = new Date("1995-12-20T03:24:00");

  // 2. Single beforeEach for all setup
  beforeEach(async () => {
    // Create test users with unique emails
    testUserId = await HelperFunctions.generateUser();
    console.log("generated user " + testUserId);
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const timestamp = Date.now();
      const testBooking = {
        id: `test-booking-${timestamp}`,
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId, 
        msg_to_hotel: "",
        created: start_date,
        updated_at: end_date
      };

      const result = await bookingRepo.createBooking(testBooking);
      expect(result).toBeDefined();
      
      // Verify the booking was created
      const createdBooking = await bookingRepo.getBookingById(`test-booking-${timestamp}`);
      expect(createdBooking).toMatchObject({
        booking_id: `test-booking-${timestamp}`,
        destination_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: "300.12",
        user_reference: testUserId,
        msg_to_hotel: ""
      });
    });
  });

  describe('getBookingById', () => { 
    it('should return null for non-existent booking', async () => {
      const result = await bookingRepo.getBookingById('non-existent');
      expect(result).toBeUndefined();
    });

    it('should return the correct booking', async () => {
      const timestamp = Date.now();
      const testBooking = {
        id: `test-booking-${timestamp}`,
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId,
        msg_to_hotel: "",
        updated_at: start_date,
        created: start_date
      };
      
      await bookingRepo.createBooking(testBooking);
      const result = await bookingRepo.getBookingById(`test-booking-${timestamp}`);
      expect(result).toBeDefined();
      expect(result?.booking_id).toBe(`test-booking-${timestamp}`);
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const timestamp = Date.now();
      
      // Create multiple bookings with unique IDs
      await bookingRepo.createBooking(booking.new({ 
        id: `booking-1-${timestamp}`,
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId,
        msg_to_hotel: "",
        updated_at: start_date,
        created: start_date 
      }));
      
      await bookingRepo.createBooking(booking.new({ 
        id: `booking-2-${timestamp}`,
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId,
        msg_to_hotel: "",
        updated_at: start_date,
        created: start_date 
      }));

      const result: any = await bookingRepo.getAllBookings();
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some((b: { booking_id: string; }) => b.booking_id === `booking-1-${timestamp}`)).toBe(true);
      expect(result.some((b: { booking_id: string; }) => b.booking_id === `booking-2-${timestamp}`)).toBe(true);
    });
  });

  describe('updateBooking', () => {
    it('should update booking fields', async () => {
      const timestamp = Date.now();
      const testBooking = {
        id: `test-booking-${timestamp}`,
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId,
        msg_to_hotel: "",
        updated_at: start_date,
        created: start_date 
      };
      
      await bookingRepo.createBooking(testBooking);

      const updates = { nights: 5, adults: 3 };
      await bookingRepo.updateBooking(`test-booking-${timestamp}`, updates);

      const updatedBooking = await bookingRepo.getBookingById(`test-booking-${timestamp}`);
      expect(updatedBooking?.nights).toBe(5);
      expect(updatedBooking?.adults).toBe(3);
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      const timestamp = Date.now();
      let start_date = new Date();
      let end_date = new Date();
      
      const testBooking = {
        id: `test-booking-${timestamp}`,
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.00,
        user_ref: testUserId,
        msg_to_hotel: "",
        created: start_date,
        updated_at: end_date
      };
      
      await bookingRepo.createBooking(testBooking);

      await bookingRepo.deleteBooking(`test-booking-${timestamp}`);
      const result = await bookingRepo.getBookingById(`test-booking-${timestamp}`);
      expect(result).toBeUndefined();
    });
  });
});