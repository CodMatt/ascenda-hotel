import * as nonAcctRepo from '../../src/repos/nonAccountRepo';
import nonAcct from '../../src/models/nonAcct';
import * as bookingRepo from '../../src/repos/bookingRepo';
import booking from '../../src/models/booking';
import db from '../../src/models/db';
import * as userRepo from '../../src/repos/UserRepo';

describe('NonAcct Repository', () => {
  let testUserId: string;
  let testBookingId: string;

  beforeAll(async () => {
    await bookingRepo.sync();
    await nonAcctRepo.sync();

    // Create test User
    testUserId = 'test-user-' + Date.now();
    await userRepo.add({
      id: testUserId,
      username: 'testuser',
      password: 'hashedpass',
      email: 'test@example.com',
      phone_num: '1234567890',
      created: new Date()
    } as any);

    // Create test booking
    testBookingId = 'test-booking-' + Date.now();
    await bookingRepo.createBooking({
      id: testBookingId,
      dest_id: 'dest-1',
      hotel_id: 'hotel-1',
      nights: 1,
      start_date: new Date(),
      end_date: new Date(),
      adults: 1,
      children: 0,
      price: 100,
    } as any);

  });

  describe('addNoAcctInfo', () => {
    it('should add non-account info for a booking', async () => {
      const testNonAcct = {
        booking_id: testBookingId,
        first_name: 'John',
        last_name: 'Doe',
        salutation: 'Mr',
        email: 'john@example.com',
        phone_num: '1234567890'
      };

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
      const result = await nonAcctRepo.getBookingsByHotel('hotel-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});