import * as userRepo from '../../src/repos/UserRepo';
import User from '../../src/models/User';
import db from '../../src/models/db';
import HelperFunctions from 'tests/support/HelperFunctions';

describe('User Repository', () => {
  describe('add', () => {
    it('should add a new user', async () => {
      const timestamp = Date.now();
      const uniqueEmail = `test-${timestamp}@example.com`;
      
      const testUser = await User.new({
        id: `test-user-${timestamp}`,
        username: 'testuser',
        password: 'hashedpass',
        first_name: 'nabei',
        last_name: 'asomth8',
        salutation: 'somein',
        email: uniqueEmail,
        phone_num: '1234567890',
        created: new Date()
      });
      
      await userRepo.add(testUser);
      const retrievedUser = await userRepo.getOne(`test-user-${timestamp}`);
      expect(retrievedUser?.username).toBe('testuser');
      expect(retrievedUser?.email).toBe(uniqueEmail);
    });
  });

  describe('getOne', () => {
    it('should return a user by id', async () => {
      const testUser = await HelperFunctions.generateUser();
      const result = await userRepo.getOne(testUser);
      expect(result?.id).toBe(testUser);
    });

    it('should return null for non-existent user', async () => {
      const result = await userRepo.getOne('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getEmailOne', () => {
    it('should return a user by email', async () => {
      const timestamp = Date.now();
      const uniqueEmail = `unique-${timestamp}@example.com`;
      
      const testUser = await User.new({
        id: `test-user-${timestamp}`,
        email: uniqueEmail
      });
      
      await userRepo.add(testUser);
      const result: any = await userRepo.getEmailOne(uniqueEmail);
      expect(result?.id).toBe(`test-user-${timestamp}`);
    });
  });

  describe('exists', () => {
    it('should check if user exists', async () => {
      const timestamp = Date.now();
      const userId = `test-user-${timestamp}`;
      const uniqueEmail = `exists-${timestamp}@example.com`;
      
      const testUser = await User.new({ 
        id: userId,
        email: uniqueEmail
      });
      
      await userRepo.add(testUser);
      expect(await userRepo.exists(userId)).toBe(true);
      expect(await userRepo.exists('non-existent')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const initialCount = (await userRepo.getAll()).length;
      console.log("initial count " + initialCount);
      
      const timestamp = Date.now();
      const user1Email = `unique1-${timestamp}@example.com`;
      const user2Email = `unique2-${timestamp}@example.com`;
      
      await userRepo.add(await User.new({
        id: `user-1-${timestamp}`,
        password: "password1",
        email: user1Email
      }));
      
      await userRepo.add(await User.new({
        id: `user-2-${timestamp}`,
        password: "password2",
        email: user2Email
      }));
      
      const result = await userRepo.getAll();
      console.log("usergetter: "+ JSON.stringify(result))
      expect(result.length).toBe(initialCount + 2);
      expect(result.some(u => u.id === `user-1-${timestamp}`)).toBe(true);
      expect(result.some(u => u.id === `user-2-${timestamp}`)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const timestamp = Date.now();
      const oldEmail = `old-${timestamp}@example.com`;
      const newEmail = `new-${timestamp}@example.com`;
      const userId = `test-user-${timestamp}`;
      
      const testUser = await User.new({
        id: userId,
        username: 'oldname',
        email: oldEmail
      });
      
      await userRepo.add(testUser);
      
      await userRepo.update(userId, await User.new({
        id: userId,
        username: 'newname',
        email: newEmail
      }));
      
      const updatedUser = await userRepo.getOne(userId);
      expect(updatedUser?.username).toBe('newname');
      expect(updatedUser?.email).toBe(newEmail);
    });
  });

  describe('deleteOne', () => {
    it('should delete a user', async () => {
      const timestamp = Date.now();
      const userId = `test-user-${timestamp}`;
      const uniqueEmail = `delete-${timestamp}@example.com`;
      
      const testUser = await User.new({ 
        id: userId,
        email: uniqueEmail
      });
      
      await userRepo.add(testUser);
      await userRepo.deleteOne(userId);
      expect(await userRepo.exists(userId)).toBe(false);
    });
  });
});