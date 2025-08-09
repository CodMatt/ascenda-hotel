import request from 'supertest';
import express from 'express';
import UserRoutes from '../../src/routes/UserRoutes';
import * as userRepo from '../../src/repos/UserRepo';
import { hashPassword } from '../../src/common/util/auth';
import HelperFunctions from 'tests/support/HelperFunctions';
 
const app = express();
app.use(express.json());
app.use('/users', UserRoutes);

describe('User Routes', () => {
  describe('POST /users', () => {
    it('should create a new user', async () => {
      const timestamp = Date.now();
      const uniqueEmail = `test-${timestamp}@example.com`;
      
      const response = await request(app)
        .post('/users')
        .send({
          username: 'testuser',
          password: 'testPass_123',
          email: uniqueEmail,
          phone_num: '1234567890'
        });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        username: 'testuser',
        email: uniqueEmail
      });
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          username: 'incomplete'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /users/login', () => {
    it('should login with correct credentials', async () => {
      const timestamp = Date.now();
      const uniqueEmail = `login-${timestamp}@example.com`;
      
      // Create a test user
      const hashedPassword = await hashPassword('correctpass');
      await userRepo.add({
        id: `login-user-${timestamp}`,
        username: 'loginuser',
        password: hashedPassword,
        email: uniqueEmail,
        phone_num: '1234567890',
        created: new Date()
      } as any);

      const response = await request(app)
        .post('/users/login')
        .send({
          email: uniqueEmail,
          password: 'correctpass'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail with incorrect credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpass'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /users', () => {
    it('should return all users (authenticated)', async () => {
      const timestamp = Date.now();
      const uniqueEmail = `user1-${timestamp}@example.com`;
      const hashedPassword = await hashPassword('correctpass');
      
      // Create test user
      await userRepo.add({
        id: `get-all-${timestamp}`,
        username: 'user1',
        password: hashedPassword,
        email: uniqueEmail,
        phone_num: '1111111111',
        created: new Date()
      } as any);

      const token = await HelperFunctions.getAuthToken(uniqueEmail, 'correctpass');
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);
      console.log("getter"+ JSON.stringify(response.body.length))
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1); // More flexible expectation
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/users');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a specific user (authenticated)', async () => {
      const timestamp = Date.now();
      const uniqueEmail = `getone-${timestamp}@example.com`;
      const userId = `get-one-${timestamp}`;
      const hashedPassword = await hashPassword('correctpass');
      
      // Create test user
      await userRepo.add({
        id: userId,
        username: 'getone',
        password: hashedPassword,
        email: uniqueEmail,
        phone_num: '3333333333',
        created: new Date()
      } as any);
        
      const token = await HelperFunctions.getAuthToken(uniqueEmail, 'correctpass');

      const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user information (authenticated)', async () => {
      const timestamp = Date.now();
      const uniqueEmail = `before-${timestamp}@example.com`;
      const userId = `update-user-${timestamp}`;
      const hashedPassword = await hashPassword('correctpass');
      
      // Create test user
      await userRepo.add({
        id: userId,
        username: 'beforeupdate',
        password: hashedPassword,
        email: uniqueEmail,
        phone_num: '4444444444',
        created: new Date()
      } as any);

      // Login to get token
      const token = await HelperFunctions.getAuthToken(uniqueEmail, 'correctpass');

      const newEmail = `after-${timestamp}@example.com`;
      const response = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'afterupdate',
          email: newEmail
        });

      expect(response.status).toBe(200);
      
      // Verify update
      const updatedUser = await userRepo.getOne(userId);
      expect(updatedUser?.username).toBe('afterupdate');
      expect(updatedUser?.email).toBe(newEmail);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user (authenticated)', async () => {
      const timestamp = Date.now();
      const uniqueEmail = `delete-${timestamp}@example.com`;
      const userId = `delete-user-${timestamp}`;
      const hashedPassword = await hashPassword('correctpass');

      // Create test user
      await userRepo.add({
        id: userId,
        username: 'tobedeleted',
        password: hashedPassword,
        email: uniqueEmail,
        phone_num: '5555555555',
        created: new Date()
      } as any);

      // Login to get token
      const token = await HelperFunctions.getAuthToken(uniqueEmail, 'correctpass');

      const response = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      // Verify deletion
      const deletedUser = await userRepo.getOne(userId);
      expect(deletedUser).toBeNull();
    });
  });
});