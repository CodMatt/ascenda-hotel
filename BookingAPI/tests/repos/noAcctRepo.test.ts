import * as nonAcctRepo from '../../src/repos/nonAccountRepo';
import nonAcct from '../../src/models/nonAcct';
import * as bookingRepo from '../../src/repos/bookingRepo';
import booking from '../../src/models/booking';
import db from '../../src/models/db';

describe('NonAcct Repository', () => {
  beforeAll(async () => {
    await bookingRepo.sync();
    await nonAcctRepo.sync();
  });

  describe('addNoAcctInfo', () => {
    it('should add non-account info for a booking', async () => {
      // First create a booking
      const testBooking = booking.new({ id: 'booking-for-nonacct' });
      await bookingRepo.createBooking(testBooking);

      const testNonAcct = nonAcct.new({
        booking_id: 'booking-for-nonacct',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone_num: '1234567890'
      });

      const result = await nonAcctRepo.addNoAcctInfo(testNonAcct);
      expect(result).toBeDefined();
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
      // Create test data
      const booking1 = booking.new({
        id: 'hotel-booking-1',
        hotel_id: 'test-hotel',
        user_ref: 'user-1'
      });
      const booking2 = booking.new({
        id: 'hotel-booking-2',
        hotel_id: 'test-hotel'
      });
      await bookingRepo.createBooking(booking1);
      await bookingRepo.createBooking(booking2);

      // Add non-account info for booking2
      await nonAcctRepo.addNoAcctInfo(nonAcct.new({
        booking_id: 'hotel-booking-2',
        first_name: 'Guest',
        last_name: 'User',
        email: 'guest@example.com'
      }));

      const result = await nonAcctRepo.getBookingsByHotel('test-hotel');
      expect(result.length).toBe(2);
      expect(result.some(b => b.booking_id === 'hotel-booking-1')).toBe(true);
      expect(result.some(b => b.booking_id === 'hotel-booking-2')).toBe(true);
    });
  });
});