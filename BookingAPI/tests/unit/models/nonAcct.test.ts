import nonAcct from '../../../src/models/nonAcct';

describe('NonAcct Model', () => {
  describe('__new__', () => {
    it('should create a new nonAccount with default values', () => {
      const newNonAcct = nonAcct.new();
      expect(newNonAcct).toEqual({
        booking_id: '',
        first_name: '',
        last_name: '',
        salutation: '',
        email: '',
        phone_num: ''
      });
    });

    it('should create with provided values', () => {
      const customNonAcct = nonAcct.new({
        booking_id: 'test-id',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone_num: '1234567890'
      });
      
      expect(customNonAcct).toEqual({
        booking_id: 'test-id',
        first_name: 'John',
        last_name: 'Doe',
        salutation: '',
        email: 'john@example.com',
        phone_num: '1234567890'
      });
    });

    it('should throw error for invalid data types', () => {
      expect(() => nonAcct.new({ booking_id: 123 as any })).toThrow();
      expect(() => nonAcct.new({ email: 123 as any })).toThrow();
    });
  });

  describe('test', () => {
    it('should validate correct nonAccount object', () => {
      const validNonAcct = nonAcct.new();
      expect(nonAcct.test(validNonAcct)).toBe(true);
    });

    it('should reject invalid nonAccount object', () => {
      expect(nonAcct.test({})).toBe(false);
      expect(nonAcct.test({ booking_id: 123 })).toBe(false);
    });
  });
});