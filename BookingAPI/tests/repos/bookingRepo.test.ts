import * as bookingRepo from '../../src/repos/bookingRepo';
import booking from '../../src/models/booking';
import HelperFunctions from 'tests/support/HelperFunctions';
//helper function


describe('Booking Repository', () => {
  // 1. Declare ALL test variables at the top
  
  // common variables used
  let testUserId: string;
  let start_date = new Date("1995-12-17T00:00:00");
  let end_date = new Date("1995-12-20T03:24:00");

  // 2. Single beforeAll for all setup
  // before all does not work lmao
  beforeEach(async () => {
    // Create test users
    testUserId = await HelperFunctions.generateUser();
    console.log("generated user"+ testUserId);
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {

      const testBooking = {
        id: 'test-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId, 
        msg_to_hotel:"",
        created: start_date,
        updated_at: end_date
      };

      const result = await bookingRepo.createBooking(testBooking);
      expect(result).toBeDefined();
      // Verify the booking was created
      const createdBooking = await bookingRepo.getBookingById('test-booking-1');
      expect(createdBooking).toMatchObject({
        booking_id: 'test-booking-1',
        destination_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: "300.12",
        user_reference: testUserId, // Use the test user ID
        msg_to_hotel:""
      });
    });
    });

  describe('getBookingById', () => { 
    
    it('should return null for non-existent booking', async () => {
      const result = await bookingRepo.getBookingById('non-existent');
      expect(result).toBeUndefined();
    });

    it('should return the correct booking', async () => {
      const testBooking = {
        id: 'test-booking-2',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId, // Use the test user ID
        msg_to_hotel:"",
        updated_at:start_date,
        created:start_date
      };
      await bookingRepo.createBooking(testBooking);
      const result = await bookingRepo.getBookingById('test-booking-2');
      expect(result).toBeDefined();
      expect(result?.booking_id).toBe('test-booking-2');
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      // Create multiple bookings
      await bookingRepo.createBooking(booking.new({ 
        id: 'booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId, // Use the test user ID
        msg_to_hotel:"",
        updated_at:start_date,
        created:start_date 
      }));
      await bookingRepo.createBooking(booking.new({ 
        id: 'booking-2',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId, // Use the test user ID
        msg_to_hotel:"",
        updated_at:start_date,
        created:start_date 
      }));

      const result: any = await bookingRepo.getAllBookings();
      expect(result.length).toBe(2);
      expect(result.some((b: { booking_id: string; }) => b.booking_id === 'booking-1')).toBe(true);
      expect(result.some((b: { booking_id: string; }) => b.booking_id === 'booking-2')).toBe(true);
    });
  });

  describe('updateBooking', () => {
    it('should update booking fields', async () => {
      const testBooking = {
        id: 'test-booking-3',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        user_ref: testUserId, // Use the test user ID
        msg_to_hotel:"",
        updated_at:start_date,
        created:start_date 
      };
      await bookingRepo.createBooking(testBooking);

      const updates = { nights: 5, adults: 3 };
      await bookingRepo.updateBooking('test-booking-3', updates);

      const updatedBooking = await bookingRepo.getBookingById('test-booking-3');
      expect(updatedBooking?.nights).toBe(5);
      expect(updatedBooking?.adults).toBe(3);
    });
  });

  describe('deleteBooking', () => {
    // beforeAll(async () => {
    //   //create new test user
    //   testUserId = 'test-user-' + Date.now();
    //     await userRepo.add({
    //       id: testUserId,
    //       username: 'testuser',
    //       password: 'hashedpass',
    //       email: 'test@example.com',
    //       phone_num: '1234567890',
    //       created: new Date()
    //     } as any);
    // });
    it('should delete a booking', async () => {
      let start_date = new Date();
      let end_date = new Date();
      const testBooking = {
        id: 'test-booking-4',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.00,
        user_ref: testUserId, // Use the test user ID
        msg_to_hotel:"",
        created: start_date,
        updated_at: end_date
      };
      await bookingRepo.createBooking(testBooking);

      await bookingRepo.deleteBooking('test-booking-4');
      const result = await bookingRepo.getBookingById('test-booking-4');
      expect(result).toBeUndefined();
    });
  });

});