import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import db from '@src/models/db';
import * as userRepo from '@src/repos/UserRepo';
import * as bookingRepo from '@src/repos/bookingRepo';
import * as nonAccountRepo from '@src/repos/nonAccountRepo';
import HelperFunctions from '../support/HelperFunctions';
import { atomicTransaction } from '@src/common/util/misc';

describe('Database Robustness Tests', () => {
  describe('Connection Resilience', () => {
    it('should recover from connection drops', async () => {
      // Simulate connection drop
      await db.getPool().end();
      
      // Attempt to reconnect
      await db.initialize();
      
      // Verify connection works
      const users = await userRepo.getAll();
      expect(Array.isArray(users)).toBe(true);
    });

    it('should handle connection pool exhaustion', async () => {
      const originalPool = db.getPool();
      const testPoolSize = 5;
      
      // Create a new pool with small size
      await db.initialize({ poolSize: testPoolSize });
      
      // Exhaust the pool
      const promises = [];
      for (let i = 0; i < testPoolSize * 2; i++) {
        promises.push(userRepo.getAll());
      }
      
      // Should not throw errors (should queue requests)
      const results = await Promise.all(promises);
      expect(results.length).toBe(testPoolSize * 2);
      
      // Restore original pool
      await db.initialize();
    });
  });

  describe('Concurrency Handling', () => {
    it('should handle concurrent user creations', async () => {
      const timestamp = Date.now();
      const concurrentUsers = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(
          userRepo.add({
            id: `concurrent-user-${timestamp}-${i}`,
            username: `user${i}`,
            password: 'password',
            email: `user-${timestamp}-${i}@example.com`,
            phone_num: '1234567890',
            created: new Date()
          } as any)
        );
      }
      
      const results = await Promise.all(promises);
      expect(results.length).toBe(concurrentUsers);
      
      // Verify all users were created
      const allUsers = await userRepo.getAll();
      const createdUsers = allUsers.filter(u => u.id.startsWith(`concurrent-user-${timestamp}`));
      expect(createdUsers.length).toBe(concurrentUsers);
    });

    it('should handle concurrent booking updates', async () => {
        const testBookingId = 'concurrent-booking-test';
        const testUserId = await HelperFunctions.generateUser();
        
        // Create test booking with version
        await bookingRepo.createBooking({
            id: 'concurrent-booking-test',
            dest_id: 'dest-1',
            hotel_id: 'hotel-1',
            start_date: new Date(),
            end_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            created: new Date(),
            updated_at: new Date(),
            nights: 1,
            adults: 2,
            children: 0,
            price: 100,
            user_ref: testUserId,
            msg_to_hotel: ''
        } as any);
        
        const concurrentUpdates = 5;
        const promises = [];
        
        for (let i = 0; i < concurrentUpdates; i++) {
            promises.push(
            bookingRepo.updateBooking(testBookingId, {
                adults: 1 + i,
                price: 100 + (i * 10)
            }).catch(e => e) // Catch errors so all promises resolve
            );
        }
        
        const results = await Promise.all(promises);
        
        // Expect some successes and some failures
        const successes = results.filter(r => !(r instanceof Error));
        const failures = results.filter(r => r instanceof Error);
        
        expect(successes.length).toBeGreaterThan(0);
        expect(failures.length).toBeGreaterThan(0);
        
        // Verify at least one update was successful
        const booking = await bookingRepo.getBookingById(testBookingId);
        expect(booking).toBeDefined();
        });
  });

  describe('Data Integrity', () => {
    it('should enforce foreign key constraints', async () => {
      // Attempt to create booking with non-existent user
      await expect(
        bookingRepo.createBooking({
          id: 'fk-test-booking',
          dest_id: 'dest-1',
          hotel_id: 'hotel-1',
          nights: 1,
          start_date: new Date(),
          end_date: new Date(),
          adults: 1,
          children: 0,
          price: 100,
          user_ref: 'non-existent-user',
          created: new Date(),
          updated_at: new Date(),
          msg_to_hotel: ''
        } as any)
      ).rejects.toThrow();
    });

    it('should maintain referential integrity on user deletion', async () => {
      // Create user and booking
      const testUserId = await HelperFunctions.generateUser();
      const testBookingId = 'ref-integrity-booking';
      
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
        user_ref: testUserId,
        created: new Date(),
        updated_at: new Date(),
        msg_to_hotel: ''
      } as any);
      
      // Delete user
      await userRepo.deleteOne(testUserId);
      
      // Verify booking still exists but user_ref is null
      const booking = await bookingRepo.getBookingById(testBookingId);
      expect(booking).toBeDefined();
      expect(booking?.user_reference).toBeNull();
    });
  });

  describe('Transaction Handling', () => {
    it('should roll back failed transactions', async () => {
        const testUserId = 'transaction-test-user';
        const initialUserCount = (await userRepo.getAll()).length;
        
        try {// simulating error within atomic transaction
            await atomicTransaction(async (client) => {
            await client.query(
                `INSERT INTO customer (id, username, password, email, phone_num, created)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [testUserId, 'transaction-user', 'password', 'transaction@example.com', '1234567890', new Date()]
            );
            
            // Simulate error INSIDE the transaction
            throw new Error('Simulated error');
            });
        } catch (error) {
            // Expected error - do nothing
        }
        
        // Verify user wasn't created
        const finalUserCount = (await userRepo.getAll()).length;
        expect(finalUserCount).toBe(initialUserCount);
        await expect(userRepo.getOne(testUserId)).resolves.toBeNull();
        });

    it('should handle nested transactions', async () => {
      const testUserId = 'nested-tx-user';
      
      await db.getPool().query('BEGIN');
      try {
        // Create user in outer transaction
        await userRepo.add({
          id: testUserId,
          username: 'nested-user',
          password: 'password',
          email: 'nested@example.com',
          phone_num: '1234567890',
          created: new Date()
        } as any);
        
        // Inner transaction
        await db.getPool().query('SAVEPOINT inner_tx');
        try {
          // Create booking
          await bookingRepo.createBooking({
            id: 'nested-tx-booking',
            dest_id: 'dest-1',
            hotel_id: 'hotel-1',
            nights: 1,
            start_date: new Date(),
            end_date: new Date(),
            adults: 1,
            children: 0,
            price: 100,
            user_ref: testUserId,
            created: new Date(),
            updated_at: new Date(),
            msg_to_hotel: ''
          } as any);
          
          // Force error in inner transaction
          throw new Error('Simulated inner error');
          
          await db.getPool().query('RELEASE SAVEPOINT inner_tx');
        } catch (error) {
          await db.getPool().query('ROLLBACK TO SAVEPOINT inner_tx');
        }
        
        await db.getPool().query('COMMIT');
      } catch (error) {
        await db.getPool().query('ROLLBACK');
      }
      
      // Verify user was created but booking wasn't
      const user = await userRepo.getOne(testUserId);
      expect(user).toBeDefined();
      
      const booking = await bookingRepo.getBookingById('nested-tx-booking');
      expect(booking).toBeUndefined();
    });
  });

  describe('Performance Under Load', () => {
    it('should handle 100 sequential queries', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        await userRepo.getAll();
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should handle 50 concurrent complex queries', async () => {
      const testHotelId = 'perf-test-hotel';
      const testUserId = await HelperFunctions.generateUser();
      
      // Create test data
      for (let i = 0; i < 10; i++) {
        await bookingRepo.createBooking({
          id: `perf-booking-${i}`,
          dest_id: 'dest-1',
          hotel_id: testHotelId,
          nights: 1,
          start_date: new Date(),
          end_date: new Date(),
          adults: 1,
          children: 0,
          price: 100,
          user_ref: Math.random() > 0.5 ? testUserId : null,
          created: new Date(),
          updated_at: new Date(),
          msg_to_hotel: ''
        } as any);
      }
      
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 50; i++) {
        promises.push(
          bookingRepo.getBookingsWithContactByHotel(testHotelId)
        );
      }
      
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(3000); // Should complete in under 3 seconds
    });
  });

  describe('Error Recovery', () => {
    it('should recover from invalid queries', async () => {
      // Execute invalid SQL
      await expect(
        db.getPool().query('SELECT * FROM non_existent_table')
      ).rejects.toThrow();
      
      // Verify subsequent valid queries work
      const users = await userRepo.getAll();
      expect(Array.isArray(users)).toBe(true);
    });

    it('should handle malformed data gracefully', async () => {
      // Attempt to insert invalid data
      await expect(
        userRepo.add({
          id: 'malformed-data-user',
          username: 'x'.repeat(1000), // Too long
          password: 'password',
          email: 'invalid-email',
          phone_num: '1234567890',
          created: new Date()
        } as any)
      ).rejects.toThrow();
      
      // Verify database is still operational
      const users = await userRepo.getAll();
      expect(Array.isArray(users)).toBe(true);
    });
  });
});
