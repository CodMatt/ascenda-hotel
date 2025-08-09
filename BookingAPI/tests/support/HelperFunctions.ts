import request from 'supertest';
import express from 'express';
import UserRoutes from '../../src/routes/UserRoutes';
import * as userRepo from '../../src/repos/UserRepo';
import bookingRepo from '../../src/repos/bookingRepo';
import * as nonAcctRepo from '../../src/repos/nonAccountRepo';
import { hashPassword } from '../../src/common/util/auth';

const app = express();
app.use(express.json());
app.use('/users', UserRoutes);

async function getAuthToken(email: string, password: string): Promise<string> {
  const loginResponse = await request(app)
    .post('/users/login')
    .send({ email, password });
    
  if (loginResponse.status !== 200) {
    console.error('Login failed:', loginResponse.body);
    throw new Error(`Login failed for ${email}`);
  }
  
  return loginResponse.body.token;
}

async function generateUser(): Promise<string> {
  const timestamp = Date.now();
  const testUserId = `test-user-${timestamp}`;
  const uniqueEmail = `test-${timestamp}@example.com`; // Make email unique
  
  const hashedPassword = await hashPassword('correctpass');
  await userRepo.add({
    id: testUserId,
    username: 'testuser',
    password: hashedPassword,
    first_name: 'nabei',
    last_name: 'asomth8',
    salutation: 'somein',
    email: uniqueEmail, // Use unique email
    phone_num: '1234567890',
    created: new Date()
  });
  
  return testUserId;
}

// Add a new function to generate user with specific email
async function generateUserWithEmail(email: string): Promise<string> {
  const timestamp = Date.now();
  const testUserId = `test-user-${timestamp}`;
  
  const hashedPassword = await hashPassword('correctpass');
  await userRepo.add({
    id: testUserId,
    username: 'testuser',
    password: hashedPassword,
    first_name: 'nabei',
    last_name: 'asomth8',
    salutation: 'somein',
    email: email,
    phone_num: '1234567890',
    created: new Date()
  });
  
  return testUserId;
}

async function generateBooking(account: Boolean, accountId?: string): Promise<string> {
  const testBookingId = 'test-booking-' + Date.now();
  
  try {
    if (account) {
      if (accountId === undefined) {
        throw new Error("user needs to have an account");
      }
      await bookingRepo.createBooking({
        id: testBookingId,
        dest_id: 'dest-1',
        hotel_id: 'hotel-1',
        nights: 1,
        start_date: new Date(),
        end_date: new Date(),
        adults: 1,
        children: 0,
        user_ref: accountId,
        price: 100,
        created: new Date(),
        updated_at: new Date(),
        msg_to_hotel: ''
      } as any);
    } else {
      console.log("Creating booking without account");
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
        created: new Date(),
        updated_at: new Date(),
        msg_to_hotel: '',
        user_ref: null
      } as any);
      
      console.log("Adding non-account info");
      await generateNoAcct(testBookingId);
    }
    return testBookingId;
  } catch (error) {
    console.log("The error is: " + error);
    throw error;
  }
}

export async function generateNoAcct(testBookingId: string): Promise<void> {
  const timestamp = Date.now();
  await nonAcctRepo.addNoAcctInfo({
    booking_id: testBookingId,
    first_name: 'John',
    last_name: 'Doe',
    salutation: 'Mr',
    email: `guest-${timestamp}@example.com`, // Make email unique
    phone_num: '1234567890'
  });
}

// Helper to wait for database operations to complete
async function waitForDatabase(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  getAuthToken,
  generateUser,
  generateUserWithEmail,
  generateBooking,
  waitForDatabase
} as const;