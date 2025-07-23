import dotenv from 'dotenv';
import db from '../../src/models/db';

dotenv.config({ path: '.env.test' });

// Setup test database connection
beforeAll(async () => {
  await db.initialize();
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables
  await db.getPool().query('DELETE FROM booking');
  await db.getPool().query('DELETE FROM nonAccount');
  await db.getPool().query('DELETE FROM User');
});

// Close connection after all tests
afterAll(async () => {
  await db.getPool().end();
});