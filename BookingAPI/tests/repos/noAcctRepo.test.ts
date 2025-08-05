import * as nonAcctRepo from '../../src/repos/nonAccountRepo';
import nonAcct from '../../src/models/nonAcct';
import * as bookingRepo from '../../src/repos/bookingRepo';
import HelperFunctions from 'tests/support/HelperFunctions';

describe('NonAcct Repository', () => {
  let testBookingId: string;
  let start_date = new Date("1995-12-17T00:00:00");
  let end_date = new Date("1995-12-20T03:24:00");
  beforeEach(async () => {
    // Create test booking
    testBookingId = 'test-booking-' + Date.now();
    await bookingRepo.createBooking({
      id: 'test-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: start_date,
        end_date: end_date,
        adults: 2,
        children: 0,
        price: 300.12,
        msg_to_hotel:"",
        created: start_date,
        updated_at: end_date
      
    } as any);
  });

  describe('addNoAcctInfo', () => {
    it('should add non-account info for a booking', async () => {
      // First verify booking exists
      const booking = await bookingRepo.getBookingById('test-booking-1');
      expect(booking).toBeDefined();

      const testNonAcct = {
        booking_id: 'test-booking-1',
        first_name: 'John',
        last_name: 'Doe',
        salutation: 'Mr',
        email: 'john@example.com',
        phone_num: '1234567890'
      };

      const result = await nonAcctRepo.addNoAcctInfo(testNonAcct);
      console.log('Insert result:', result);
      
      // Verify result exists and has expected fields
      expect(result).toBeDefined();
      expect(result.booking_id).toBe('test-booking-1');
      expect(result.first_name).toBe('John');
    });

    it('should fail for non-existent booking', async () => {
      const testNonAcct = nonAcct.new({
        booking_id: 'non-existent-booking',
        first_name: 'John'
      });

      await expect(nonAcctRepo.addNoAcctInfo(testNonAcct)).rejects.toThrow();
    });
  });

  describe('getBookingsByHotel', () => {
    it('should return bookings for a hotel', async () => {
      const result = await nonAcctRepo.getBookingsByHotel('hotel-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});