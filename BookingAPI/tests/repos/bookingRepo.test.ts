import * as bookingRepo from '../../src/repos/bookingRepo';
import booking from '../../src/models/booking';
import db from '../../src/models/db';

describe('Booking Repository', () => {
  beforeAll(async () => {
    await bookingRepo.sync();
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const testBooking = booking.new({
        id: 'test-booking-1',
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        start_date: new Date('2023-01-01'),
        end_date: new Date('2023-01-04'),
        adults: 2,
        price: 300
      });

      const result = await bookingRepo.createBooking(testBooking);
      expect(result).toBeDefined();

      // Verify the booking was created
      const createdBooking = await bookingRepo.getBookingById('test-booking-1');
      expect(createdBooking).toMatchObject({
        booking_id: 'test-booking-1',
        destination_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 3,
        adults: 2,
        price: 300
      });
    });
  });

  describe('getBookingById', () => {
    it('should return null for non-existent booking', async () => {
      const result = await bookingRepo.getBookingById('non-existent');
      expect(result).toBeUndefined();
    });

    it('should return the correct booking', async () => {
      const testBooking = booking.new({
        id: 'test-booking-2',
        dest_id: 'dest-2',
        hotel_id: 'hotel-2'
      });
      await bookingRepo.createBooking(testBooking);

      const result = await bookingRepo.getBookingById('test-booking-2');
      expect(result).toBeDefined();
      expect(result?.booking_id).toBe('test-booking-2');
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      // Create multiple bookings
      await bookingRepo.createBooking(booking.new({ id: 'booking-1' }));
      await bookingRepo.createBooking(booking.new({ id: 'booking-2' }));

      const result: any = await bookingRepo.getAllBookings();
      expect(result.length()).toBe(2);
      expect(result.some((b: { booking_id: string; }) => b.booking_id === 'booking-1')).toBe(true);
      expect(result.some((b: { booking_id: string; }) => b.booking_id === 'booking-2')).toBe(true);
    });
  });

  describe('updateBooking', () => {
    it('should update booking fields', async () => {
      const testBooking = booking.new({
        id: 'test-booking-3',
        dest_id: 'dest-3',
        hotel_id: 'hotel-3',
        nights: 1
      });
      await bookingRepo.createBooking(testBooking);

      const updates = { nights: 5, adults: 3 };
      await bookingRepo.updateBooking('test-booking-3', updates);

      const updatedBooking = await bookingRepo.getBookingById('test-booking-3');
      expect(updatedBooking?.nights).toBe(5);
      expect(updatedBooking?.adults).toBe(3);
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      const testBooking = booking.new({ id: 'test-booking-4' });
      await bookingRepo.createBooking(testBooking);

      await bookingRepo.deleteBooking('test-booking-4');
      const result = await bookingRepo.getBookingById('test-booking-4');
      expect(result).toBeUndefined();
    });
  });
});