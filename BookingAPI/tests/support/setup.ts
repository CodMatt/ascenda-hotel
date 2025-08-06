import dotenv from 'dotenv';
import db from '../../src/models/db';

import * as userRepo from '../../src/repos/UserRepo';
import * as bookingRepo from '../../src/repos/bookingRepo';
import * as nonAccountRepo from '../../src/repos/nonAccountRepo';

dotenv.config({ path: '.env.test' });

// Setup test database connection
beforeAll(async () => {
  await db.initialize();
  // Create tables in proper order
  await userRepo.sync();
  await bookingRepo.sync();
  await nonAccountRepo.sync();
});

// Clean up after each test

afterEach(async () => {
  const pool = db.getPool();
  // Clear data in reverse order of foreign key dependencies
  try{
    await pool.query('DELETE FROM nonaccount');
    await pool.query('DELETE FROM booking');
    await pool.query('DELETE FROM customer');
  }catch(error){
    console.log("error deleting data: " + error)
    throw error;
  }
});

// Close connection after all tests
afterAll(async () => {
  await db.getPool().end();
});