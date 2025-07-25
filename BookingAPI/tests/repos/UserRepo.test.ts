import * as userRepo from '../../src/repos/UserRepo';
import User from '../../src/models/User';

describe('User Repository', () => {
  beforeAll(async () => {
    await userRepo.sync();
  });
  describe('add', () => {
    it('should add a new user', async () => {
      const testUser = await User.new({
        id: 'test-user-1',
        username: 'testuser',
        password: 'testpass',
        email: 'test@example.com',
        phone_num: '1234567890'
      });

      await userRepo.add(testUser);
      const retrievedUser = await userRepo.getOne('test-user-1');
      expect(retrievedUser?.username).toBe('testuser');
      expect(retrievedUser?.email).toBe('test@example.com');
    });
  });

  describe('getOne', () => {
    it('should return a user by id', async () => {
      const testUser = await User.new({
        id: 'test-user-2',
        username: 'testuser2',
        password: 'testpass',
        email: 'test2@example.com',
        phone_num: '1234567890'
      });

      await userRepo.add(testUser);
      const result = await userRepo.getOne('test-user-2');
      expect(result?.id).toBe('test-user-2');
    });

    it('should return null for non-existent user', async () => {
      const result = await userRepo.getOne('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getEmailOne', () => {
    it('should return a user by email', async () => {
      const testUser = await User.new({
        id: 'test-user-3',
        email: 'unique@example.com'
      });
      await userRepo.add(testUser);

      const result:any = await userRepo.getEmailOne('unique@example.com');
      expect(result?.id).toBe('test-user-3');
    });
  });

  describe('exists', () => {
    it('should check if user exists', async () => {
      const testUser = await User.new({ id: 'test-user-4' });
      await userRepo.add(testUser);

      expect(await userRepo.exists('test-user-4')).toBe(true);
      expect(await userRepo.exists('non-existent')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      await userRepo.add(await User.new({ id: 'user-1' }));
      await userRepo.add(await User.new({ id: 'user-2' }));

      const result = await userRepo.getAll();
      expect(result.length).toBe(2);
      expect(result.some(u => u.id === 'user-1')).toBe(true);
      expect(result.some(u => u.id === 'user-2')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const testUser = await User.new({
        id: 'test-user-5',
        username: 'oldname',
        email: 'old@example.com'
      });
      await userRepo.add(testUser);

      await userRepo.update('test-user-5', await User.new({
        id: 'test-user-5',
        username: 'newname',
        email: 'new@example.com'
      }));

      const updatedUser = await userRepo.getOne('test-user-5');
      expect(updatedUser?.username).toBe('newname');
      expect(updatedUser?.email).toBe('new@example.com');
    });
  });

  describe('deleteOne', () => {
    it('should delete a user', async () => {
      const testUser = await User.new({ id: 'test-user-6' });
      await userRepo.add(testUser);

      await userRepo.deleteOne('test-user-6');
      expect(await userRepo.exists('test-user-6')).toBe(false);
    });
  });
});