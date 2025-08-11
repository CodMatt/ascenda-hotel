import * as nonAcctRepo from '../../../src/repos/nonAccountRepo';
import nonAcct from '../../../src/models/nonAcct';
import * as bookingRepo from '../../../src/repos/bookingRepo';
import HelperFunctions from 'tests/support/HelperFunctions';

describe('NonAcct Repository', () => {
  let testBookingId: string;
  let start_date = new Date("1995-12-17T00:00:00");
  let end_date = new Date("1995-12-20T03:24:00");

  beforeEach(async () => {
    try {
      const timestamp = Date.now() + Math.random() * 1000;
      testBookingId = `test-booking-${timestamp}`;
      
      // Create booking without user reference (guest booking)
      const bookingData = {
        id: testBookingId,
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        msg_to_hotel: "",
        created: start_date,
        updated_at: end_date,
        user_ref: null // No user reference for guest booking
      };
      
      await bookingRepo.createBooking(bookingData as any);
      
      // CRITICAL: Wait for booking to be fully created and verify
      await HelperFunctions.waitForDatabase(150);
      
      const verifyBooking = await bookingRepo.getBookingById(testBookingId);
      if (!verifyBooking) {
        throw new Error(`Failed to create test booking ${testBookingId}`);
      }
      
      console.log("✅ Created test booking for nonAcct tests:", testBookingId);
    } catch (error) {
      console.error("❌ Failed to setup booking for nonAcct tests:", error);
      throw error;
    }
  });

  describe('addNoAcctInfo', () => {
    it('should add non-account info for a booking', async () => {
      // First verify booking exists
      const booking = await bookingRepo.getBookingById(testBookingId);
      expect(booking).toBeDefined();
      expect(booking?.booking_id).toBe(testBookingId);

      const timestamp = Date.now();
      const testNonAcct = {
        booking_id: testBookingId,
        first_name: 'John',
        last_name: 'Doe',
        salutation: 'Mr',
        email: `john-${timestamp}@example.com`,
        phone_num: '1234567890'
      };

      try {
        const result = await nonAcctRepo.addNoAcctInfo(testNonAcct);
        console.log('✅ Insert result:', result);

        // Verify result exists and has expected fields
        expect(result).toBeDefined();
        expect(result.booking_id).toBe(testBookingId);
        expect(result.first_name).toBe('John');
      } catch (error) {
        console.error('❌ Failed to add non-account info:', error);
        throw error;
      }
    });

    it('should fail for non-existent booking', async () => {
      const timestamp = Date.now();
      const testNonAcct = nonAcct.new({
        booking_id: `non-existent-booking-${timestamp}`, // Make it unique
        first_name: 'John',
        email: `john-${timestamp}@example.com`
      });

      await expect(nonAcctRepo.addNoAcctInfo(testNonAcct)).rejects.toThrow();
    });
  });

  describe('getBookingsByHotel', () => {
    it('should return bookings for a hotel', async () => {
      // First add the non-account info for our test booking
      const timestamp = Date.now();
      const nonAcctData = {
        booking_id: testBookingId,
        first_name: 'Test',
        last_name: 'Guest',
        salutation: 'Mr',
        email: `test-guest-${timestamp}@example.com`,
        phone_num: '1234567890'
      };
      
      try {
        await nonAcctRepo.addNoAcctInfo(nonAcctData);
        
        // Wait for the insert to complete
        await HelperFunctions.waitForDatabase(150);
        
        const result = await nonAcctRepo.getBookingsByHotel('hotel-1');
        expect(Array.isArray(result)).toBe(true);
        
        console.log(`Found ${result.length} bookings for hotel-1`);
        console.log('Test booking ID:', testBookingId);
        console.log('Booking IDs found:', result.map((b: any) => b.booking_id));
        
        // More flexible expectation - check if our specific booking exists
        const ourBooking = result.find((b: any) => b.booking_id === testBookingId);
        expect(ourBooking).toBeDefined();
        
        // If our booking exists, the test passes regardless of total count
        console.log('✅ Found our test booking in results');
      } catch (error) {
        console.error('❌ Failed in getBookingsByHotel test:', error);
        throw error;
      }
    });

    it('should return empty array for hotel with no bookings', async () => {
      const timestamp = Date.now();
      const result = await nonAcctRepo.getBookingsByHotel(`no-bookings-hotel-${timestamp}`);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});