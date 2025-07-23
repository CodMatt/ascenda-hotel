import request from 'supertest';
import express from 'express';
import UserRoutes from '../../src/routes/UserRoutes';
import * as userRepo from '../../src/repos/UserRepo';
import db from '../../src/models/db';
import { hashPassword } from '../../src/common/util/auth';

const app = express();
app.use(express.json());
app.use('/users', UserRoutes);

describe('User Routes', () => {
  beforeAll(async () => {
    await userRepo.sync();
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          username: 'testuser',
          password: 'testpass',
          email: 'test@example.com',
          phone_num: '1234567890'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com'
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
      // Create a test user
      const hashedPassword = await hashPassword('correctpass');
      await userRepo.add({
        id: 'login-user-1',
        username: 'loginuser',
        password: hashedPassword,
        email: 'login@example.com',
        phone_num: '1234567890',
        created: new Date()
      } as any);

      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'login@example.com',
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
      // Create test users
      await userRepo.add({
        id: 'get-all-1',
        username: 'user1',
        password: 'pass1',
        email: 'user1@example.com',
        phone_num: '1111111111',
        created: new Date()
      } as any);
      await userRepo.add({
        id: 'get-all-2',
        username: 'user2',
        password: 'pass2',
        email: 'user2@example.com',
        phone_num: '2222222222',
        created: new Date()
      } as any);

      // First login to get token
      const loginResponse = await request(app)
        .post('/users/login')
        .send({
          email: 'user1@example.com',
          password: 'pass1'
        });
      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/users');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a specific user (authenticated)', async () => {
      // Create test user
      await userRepo.add({
        id: 'get-one-1',
        username: 'getone',
        password: 'pass',
        email: 'getone@example.com',
        phone_num: '3333333333',
        created: new Date()
      } as any);

      // Login to get token
      const loginResponse = await request(app)
        .post('/users/login')
        .send({
          email: 'getone@example.com',
          password: 'pass'
        });
      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/users/get-one-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('get-one-1');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user information (authenticated)', async () => {
      // Create test user
      await userRepo.add({
        id: 'update-user-1',
        username: 'beforeupdate',
        password: 'pass',
        email: 'before@example.com',
        phone_num: '4444444444',
        created: new Date()
      } as any);

      // Login to get token
      const loginResponse = await request(app)
        .post('/users/login')
        .send({
          email: 'before@example.com',
          password: 'pass'
        });
      const token = loginResponse.body.token;

      const response = await request(app)
        .put('/users/update-user-1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'afterupdate',
          email: 'after@example.com'
        });

      expect(response.status).toBe(200);
      
      // Verify update
      const updatedUser = await userRepo.getOne('update-user-1');
      expect(updatedUser?.username).toBe('afterupdate');
      expect(updatedUser?.email).toBe('after@example.com');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user (authenticated)', async () => {
      // Create test user
      await userRepo.add({
        id: 'delete-user-1',
        username: 'tobedeleted',
        password: 'pass',
        email: 'delete@example.com',
        phone_num: '5555555555',
        created: new Date()
      } as any);

      // Login to get token
      const loginResponse = await request(app)
        .post('/users/login')
        .send({
          email: 'delete@example.com',
          password: 'pass'
        });
      const token = loginResponse.body.token;

      const response = await request(app)
        .delete('/users/delete-user-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      // Verify deletion
      const deletedUser = await userRepo.getOne('delete-user-1');
      expect(deletedUser).toBeNull();
    });
  });
});