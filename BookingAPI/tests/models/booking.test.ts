import booking from '../../src/models/booking';

describe('Booking Model', () => {
  describe('__new__', () => {
    it('should create a new booking with default values', () => {
      const newBooking = booking.new();
      expect(newBooking).toMatchObject({
        id: '',
        dest_id: '',
        hotel_id: '',
        nights: 0,
        adults: 0,
        children: 0,
        msg_to_hotel: '',
        user_ref: null,
        price: 0
      });
      expect(newBooking.start_date).toBeInstanceOf(Date);
      expect(newBooking.end_date).toBeInstanceOf(Date);
      expect(newBooking.created).toBeInstanceOf(Date);
      expect(newBooking.updated_at).toBeInstanceOf(Date);
    });

    it('should create a booking with provided values', () => {
      const testDate = new Date();
      const customBooking = booking.new({
        id: 'test-id',
        dest_id: 'test-dest',
        hotel_id: 'test-hotel',
        nights: 3,
        start_date: testDate,
        end_date: testDate,
        adults: 2,
        price: 100
      });
      
      expect(customBooking).toMatchObject({
        id: 'test-id',
        dest_id: 'test-dest',
        hotel_id: 'test-hotel',
        nights: 3,
        start_date: testDate,
        end_date: testDate,
        adults: 2,
        price: 100
      });
      expect(customBooking.start_date).toEqual(testDate);
      expect(customBooking.end_date).toEqual(testDate);
    });

    it('should throw error for invalid data types', () => {
      expect(() => booking.new({ nights: 'invalid' as any })).toThrow();
      expect(() => booking.new({ start_date: 'invalid' as any })).toThrow();
      expect(() => booking.new({ price: 'invalid' as any })).toThrow();
    });
  });

  describe('test', () => {
    it('should validate correct booking object', () => {
      const validBooking = booking.new();
      expect(booking.test(validBooking)).toBe(true);
    });

    it('should reject invalid booking object', () => {
      expect(booking.test({})).toBe(false);
      expect(booking.test({ id: 123 })).toBe(false);
      expect(booking.test({ dest_id: 123 })).toBe(false);
    });

     it('should call error callback for invalid objects', () => {
      const mockErrorCb = vi.fn(); 
      booking.test({}, mockErrorCb);
      expect(mockErrorCb).toHaveBeenCalled();
    });
  });
});