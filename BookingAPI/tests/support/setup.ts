import dotenv from 'dotenv';
import db from '../../src/models/db';
import * as userRepo from '../../src/repos/UserRepo';
import * as bookingRepo from '../../src/repos/bookingRepo';
import * as nonAccountRepo from '../../src/repos/nonAccountRepo';

dotenv.config({ path: '.env.test' });

// Track if tables are already synced globally
let tablesAlreadySynced = false;
let setupLock = false;

// Setup test database connection
beforeAll(async () => {
  // Prevent concurrent setup
  if (setupLock) {
    await new Promise(resolve => {
      const checkSetup = () => {
        if (tablesAlreadySynced) resolve(true);
        else setTimeout(checkSetup, 100);
      };
      checkSetup();
    });
    return;
  }
  
  setupLock = true;
  
  try {
    await db.initialize();
    
    // Only sync tables once globally across all test files
    if (!tablesAlreadySynced) {
      const maxRetries = 5;
      for (let i = 0; i < maxRetries; i++) {
        try {
          // Add random delay to reduce concurrency conflicts
          await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
          
          await userRepo.sync();
          await bookingRepo.sync();
          await nonAccountRepo.sync();
          
          tablesAlreadySynced = true;
          console.log('✅ Database tables synced successfully');
          break;
        } catch (error) {
          if (error.message?.includes('tuple concurrently updated') && i < maxRetries - 1) {
            console.log(`Sync attempt ${i + 1} failed due to concurrency, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            continue;
          }
          
          if (i === maxRetries - 1) {
            console.log("Failed to sync tables after all retries:", error);
            throw error;
          }
          
          console.log(`Sync attempt ${i + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
  } finally {
    setupLock = false;
  }
});

// OPTIMIZED: Simpler, more reliable cleanup
afterEach(async () => {
  const pool = db.getPool();
  
  try {
    // Method 1: Try manual deletion in correct order (most reliable)
    await pool.query('DELETE FROM nonaccount WHERE booking_id IN (SELECT booking_id FROM booking)');
    await pool.query('DELETE FROM booking');
    await pool.query('DELETE FROM customer');
    
    console.log('✅ Database cleanup successful (manual delete)');
  } catch (error) {
    console.log("Manual delete cleanup failed, trying TRUNCATE:", error);
    
    try {
      // Method 2: Use TRUNCATE with CASCADE as fallback
      await pool.query('TRUNCATE TABLE customer CASCADE');
      console.log('✅ Database cleanup successful (TRUNCATE CASCADE)');
    } catch (truncateError) {
      console.log("All cleanup methods failed:", truncateError);
      
      try {
        // Method 3: Nuclear option - delete with subqueries
        await pool.query(`
          DELETE FROM nonaccount WHERE booking_id NOT IN (
            SELECT booking_id FROM booking WHERE booking_id IS NULL
          )
        `);
        await pool.query('DELETE FROM booking WHERE 1=1');
        await pool.query('DELETE FROM customer WHERE 1=1');
        console.log('✅ Database cleanup successful (nuclear option)');
      } catch (nuclearError) {
        console.log("Even nuclear cleanup failed:", nuclearError);
      }
    }
  }
});

// Close connection after all tests
afterAll(async () => {
  try {
    await db.getPool().end();
  } catch (error) {
    console.log("Error closing database connection:", error);
  }
});