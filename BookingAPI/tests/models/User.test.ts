import User from '../../src/models/User';

describe('User Model', () => {
  describe('__new__', () => {
    it('should create a new user with default values', async () => {
      const newUser = await User.new();
      expect(newUser).toMatchObject({
        id: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        salutations: '',
        email: '',
        phone_num: ''
      });
      expect(newUser.created).toBeInstanceOf(Date);
    });

    it('should create a user with provided values', async () => {
      const customUser = await User.new({
        id: 'test-id',
        username: 'testuser',
        password: 'testpass',
        email: 'test@example.com',
        phone_num: '1234567890'
      });
      
      expect(customUser).toMatchObject({
        id: 'test-id',
        username: 'testuser',
        email: 'test@example.com',
        phone_num: '1234567890'
      });
      expect(customUser.password).not.toBe('testpass'); // Should be hashed
    });

    it('should throw error for invalid data types', async () => {
      await expect(User.new({ id: 123 as any })).rejects.toThrow();
      await expect(User.new({ email: 123 as any })).rejects.toThrow();
    });
  });

  describe('test', () => {
    it('should validate correct user object', async () => {
      const validUser = await User.new();
      expect(User.test(validUser)).toBe(true);
    });

    it('should reject invalid user object', () => {
      expect(User.test({})).toBe(false);
      expect(User.test({ id: 123 })).toBe(false);
    });
  });
});