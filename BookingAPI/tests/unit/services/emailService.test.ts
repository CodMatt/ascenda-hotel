import { emailService, EmailService } from '../../../src/services/emailService';
import * as bookingRepo from '../../../src/repos/bookingRepo';
import * as userRepo from '../../../src/repos/UserRepo';
import * as nonAccountRepo from '../../../src/repos/nonAccountRepo';
import db from '../../../src/models/db';
import jwt from 'jsonwebtoken';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import HelperFunctions from 'tests/support/HelperFunctions';
import { hashPassword } from '../../../src/common/util/auth';

// Mock external dependencies
vi.mock('../../../src/repos/bookingRepo');
vi.mock('../../../src/repos/UserRepo');
vi.mock('../../../src/repos/nonAccountRepo');
vi.mock('../../../src/models/db');
vi.mock('nodemailer');
vi.mock('jsonwebtoken');

// Mock environment variables
vi.mock('../../../src/common/constants/ENV', () => ({
  default: {
    SmtpUser: 'test@example.com',
    SmtpPassword: 'test-password',
    SmtpFrom: 'noreply@example.com',
    JwtSecret: 'test-jwt-secret',
    FrontendUrl: 'https://test-frontend.com'
  }
}));

describe('Email Service', () => {
  let mockConnection: any;
  let mockPool: any;
  let testBookingId: string;
  let testUserBookingId: string;
  let testUserId: string;
  const testEmail = 'guest@example.com';

  beforeEach(async() => {
    vi.clearAllMocks();
    
    // Mock database connection
    mockConnection = {
      query: vi.fn(),
      release: vi.fn()
    };
    
    mockPool = {
      connect: vi.fn().mockResolvedValue(mockConnection),
      query: vi.fn()
    };
    
    (db.getPool as any).mockReturnValue(mockPool);

    // Create test data in actual database
    testUserId = await HelperFunctions.generateUserWithEmail(testEmail);
    testBookingId = await HelperFunctions.generateBooking(false); // Guest booking
    testUserBookingId = await HelperFunctions.generateBooking(true, testUserId); // User booking

    // Mock successful database transaction
    mockConnection.query.mockImplementation((sql: string) => {
      if (sql === 'BEGIN') return Promise.resolve();
      if (sql === 'COMMIT') return Promise.resolve();
      if (sql === 'ROLLBACK') return Promise.resolve();
      return Promise.resolve({ rows: [] });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendBookingAccessEmail', () => {
    const testBookingId = 'test-booking-123';
    const testEmail = 'guest@example.com';

    beforeEach(() => {
      // Mock successful database transaction
      mockConnection.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN') return Promise.resolve();
        if (sql === 'COMMIT') return Promise.resolve();
        if (sql === 'ROLLBACK') return Promise.resolve();
        return Promise.resolve({ rows: [] });
      });
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      // Clean up test data
      await bookingRepo.deleteBooking(testBookingId);
      await bookingRepo.deleteBooking(testUserBookingId);
      await userRepo.deleteOne(testUserId);
    });

    it('should send email for guest booking successfully', async () => {
  // 1. Mock the combined booking info query response
  const bookingInfoResult = {
    rows: [{
      booking_id: testBookingId,
      first_name: 'John',
      last_name: 'Doe',
      email: testEmail,
      booking_type: 'guest',
      username: null // Important for guest bookings
    }]
  };

  // 2. Mock empty existing token result
  const existingTokenResult = { rows: [] };

  // 3. Mock successful token insertion
  const insertTokenResult = { rows: [{ id: 'access-123' }] };

  // 4. Setup mock responses in execution order
  mockConnection.query
    .mockResolvedValueOnce({}) // BEGIN transaction
    .mockResolvedValueOnce(bookingInfoResult) // Combined booking info query
    .mockResolvedValueOnce(existingTokenResult) // Existing token check
    .mockResolvedValueOnce(insertTokenResult) // Token insertion
    .mockResolvedValueOnce({}) // COMMIT transaction

  // 5. Mock email transporter
  const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' });
  emailService['transporter'] = { sendMail: mockSendMail } as any;

  // 6. Execute
  const result = await emailService.sendBookingAccessEmail(testBookingId, testEmail);
  
  // 7. Assertions
  expect(result.success).toBe(true);
  expect(result.message).toContain('guest');
  expect(mockSendMail).toHaveBeenCalledOnce();
  
  // Verify transaction was committed
  const commitCalled = mockConnection.query.mock.calls.some((call: string[]) => 
    call[0] === 'COMMIT'
  );
  expect(commitCalled).toBe(true);
});

    it('should send email for user account booking successfully', async () => {
        const guestBookingResult = { rows: [] };
        const userBookingResult = {
          rows: [{
            booking_id: testBookingId,
            first_name: 'Jane',
            last_name: 'Smith',
            email: testEmail,
            username: 'janesmith',
            booking_type: 'user'
          }]
        };
        const existingTokenResult = { rows: [] };

        mockConnection.query
          .mockResolvedValueOnce(guestBookingResult)
          .mockResolvedValueOnce(userBookingResult)
          .mockResolvedValueOnce(existingTokenResult)
          .mockResolvedValueOnce({ rows: [{ id: 'access-456' }] });

        const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' });
        emailService['transporter'] = { sendMail: mockSendMail } as any;

        const result = await emailService.sendBookingAccessEmail(testBookingId, testEmail);

        expect(result.success).toBe(true);
        expect(result.message).toContain('Access email sent successfully to guest');
        expect(mockSendMail).toHaveBeenCalledOnce();
      });

      it('should reuse existing valid token', async () => {
    // 1. Mock the combined booking info query response
    const bookingInfoResult = {
      rows: [{
        booking_id: testBookingId,
        first_name: 'John',
        last_name: 'Doe',
        email: testEmail,
        booking_type: 'guest',
        username: null // Important for guest bookings
      }]
    };

    // 2. Mock the existing token query response
    const existingTokenResult = {
      rows: [{
        access_token: 'existing-token-123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }]
    };

    // 3. Setup the mock query responses in execution order
    mockConnection.query
      .mockResolvedValueOnce({}) // BEGIN transaction
      .mockResolvedValueOnce(bookingInfoResult) // getBookingInfo()
      .mockResolvedValueOnce(existingTokenResult) // getValidAccessToken()
      .mockResolvedValueOnce({}) // COMMIT transaction
      // Note: No INSERT query should be called

    // 4. Mock the email transporter
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' });
    emailService['transporter'] = { sendMail: mockSendMail } as any;

    // 5. Execute the function
    const result = await emailService.sendBookingAccessEmail(testBookingId, testEmail);
    
    // 6. Assertions
    expect(result).toEqual({
      success: true,
      accessToken: 'existing-token-123',
      message: 'Access email sent successfully to guest'
    });

    // 7. Verify the query sequence
    const queryCalls = mockConnection.query.mock.calls.map((call: any[]) => call[0]);
    expect(queryCalls).toEqual([
      'BEGIN',
      expect.stringContaining('FROM booking'), // The booking info query
      expect.stringContaining('FROM guest_booking_access'), // Existing token query
      'COMMIT'
    ]);

    // 8. Verify no new token was inserted
    const insertQueryCalled = queryCalls.some((call: string | string[]) => 
      call.includes('INSERT INTO guest_booking_access')
    );
    expect(insertQueryCalled).toBe(false);

    // 9. Verify email was sent
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: testEmail,
      subject: expect.stringContaining(testBookingId),
    }));
  });

    it('should return failure for non-existent booking', async () => {
      const guestBookingResult = { rows: [] };
      const userBookingResult = { rows: [] };

      mockConnection.query
        .mockResolvedValueOnce(guestBookingResult)
        .mockResolvedValueOnce(userBookingResult);

      const result = await emailService.sendBookingAccessEmail(testBookingId, testEmail);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
      expect(mockConnection.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should handle email sending failures gracefully', async () => {
      const guestBookingResult = {
        rows: [{
          booking_id: testBookingId,
          first_name: 'John',
          last_name: 'Doe',
          email: testEmail,
          booking_type: 'guest'
        }]
      };
      const userBookingResult = { rows: [] };
      const existingTokenResult = { rows: [] };

      mockConnection.query
        .mockResolvedValueOnce(guestBookingResult)
        .mockResolvedValueOnce(userBookingResult)
        .mockResolvedValueOnce(existingTokenResult)
        .mockResolvedValueOnce({ rows: [{ id: 'access-789' }] });

      // Mock email sending failure
      const mockSendMail = vi.fn().mockRejectedValue(new Error('SMTP server down'));
      emailService['transporter'] = { sendMail: mockSendMail } as any;

      const result = await emailService.sendBookingAccessEmail(testBookingId, testEmail);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Booking not found or email does not match our records');
      expect(mockConnection.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should handle database errors gracefully', async () => {
      mockConnection.query.mockRejectedValue(new Error('Database connection failed'));

      const result = await emailService.sendBookingAccessEmail(testBookingId, testEmail);
      console.log('Service response:', result); // Add this for debugging
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to process your request. Please try again later.');
      expect(result.accessToken).toBeUndefined();
      expect(mockConnection.query).toHaveBeenCalledWith('ROLLBACK');
        });
      });

  describe('verifyGuestAccessToken', () => {
    const testToken = 'test-jwt-token';
    const testBookingId = 'test-booking-456';
    const testEmail = 'test@example.com';

    it('should verify valid token successfully', async () => {
      // Mock JWT verification
      const mockDecoded = {
        bookingId: testBookingId,
        email: testEmail,
        purpose: 'guest_booking_access',
        timestamp: Date.now()
      };
      (jwt.verify as any).mockReturnValue(mockDecoded);

      // Mock database token lookup
      const tokenResult = {
        rows: [{
          booking_id: testBookingId,
          email: testEmail,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          used: false
        }]
      };
      
      const bookingTypeResult = {
        rows: [{ booking_type: 'guest' }]
      };

      mockPool.query
        .mockResolvedValueOnce(tokenResult)
        .mockResolvedValueOnce(bookingTypeResult);

      const result = await emailService.verifyGuestAccessToken(testToken);

      expect(result.valid).toBe(true);
      expect(result.bookingId).toBe(testBookingId);
      expect(result.email).toBe(testEmail);
      expect(result.bookingType).toBe('guest');
      expect(result.message).toBe('Access token is valid');
    });

    it('should reject token with wrong purpose', async () => {
      const mockDecoded = {
        bookingId: testBookingId,
        email: testEmail,
        purpose: 'wrong_purpose',
        timestamp: Date.now()
      };
      (jwt.verify as any).mockReturnValue(mockDecoded);

      const result = await emailService.verifyGuestAccessToken(testToken);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid access token purpose');
    });

    it('should reject token not found in database', async () => {
      const mockDecoded = {
        bookingId: testBookingId,
        email: testEmail,
        purpose: 'guest_booking_access',
        timestamp: Date.now()
      };
      (jwt.verify as any).mockReturnValue(mockDecoded);

      const tokenResult = { rows: [] };
      mockPool.query.mockResolvedValueOnce(tokenResult);

      const result = await emailService.verifyGuestAccessToken(testToken);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Access token not found');
    });

    it('should reject expired token', async () => {
      const mockDecoded = {
        bookingId: testBookingId,
        email: testEmail,
        purpose: 'guest_booking_access',
        timestamp: Date.now()
      };
      (jwt.verify as any).mockReturnValue(mockDecoded);

      const tokenResult = {
        rows: [{
          booking_id: testBookingId,
          email: testEmail,
          expires_at: new Date(Date.now() - 1000), // Expired 1 second ago
          used: false
        }]
      };

      mockPool.query.mockResolvedValueOnce(tokenResult);

      const result = await emailService.verifyGuestAccessToken(testToken);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Access token has expired');
    });

    it('should handle JWT verification errors', async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error('Invalid token signature');
      });

      const result = await emailService.verifyGuestAccessToken(testToken);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid access token');
    });

    it('should handle expired JWT tokens', async () => {
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      (jwt.verify as any).mockImplementation(() => {
        throw expiredError;
      });

      const result = await emailService.verifyGuestAccessToken(testToken);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Access token has expired');
    });

    it('should identify user booking type correctly', async () => {
      const mockDecoded = {
        bookingId: testBookingId,
        email: testEmail,
        purpose: 'guest_booking_access',
        timestamp: Date.now()
      };
      (jwt.verify as any).mockReturnValue(mockDecoded);

      const tokenResult = {
        rows: [{
          booking_id: testBookingId,
          email: testEmail,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          used: false
        }]
      };
      
      const bookingTypeResult = {
        rows: [{ booking_type: 'user' }]
      };

      mockPool.query
        .mockResolvedValueOnce(tokenResult)
        .mockResolvedValueOnce(bookingTypeResult);

      const result = await emailService.verifyGuestAccessToken(testToken);

      expect(result.valid).toBe(true);
      expect(result.bookingType).toBe('user');
    });
  });

  describe('markTokenAsUsed', () => {
    it('should mark token as used successfully', async () => {
      const testToken = 'token-to-mark-used';
      mockPool.query.mockResolvedValue({ rowCount: 1 });

      await emailService.markTokenAsUsed(testToken);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE guest_booking_access'),
        [testToken]
      );
    });

    it('should handle database errors when marking token as used', async () => {
      const testToken = 'token-with-error';
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(emailService.markTokenAsUsed(testToken)).rejects.toThrow('Database error');
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens and return count', async () => {
      const deletedCount = 5;
      mockPool.query.mockResolvedValue({ rowCount: deletedCount });

      const result = await emailService.cleanupExpiredTokens();

      expect(result).toBe(deletedCount);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM guest_booking_access')
      );
    });

    it('should return 0 when no tokens are deleted', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 });

      const result = await emailService.cleanupExpiredTokens();

      expect(result).toBe(0);
    });

    it('should handle null rowCount', async () => {
      mockPool.query.mockResolvedValue({ rowCount: null });

      const result = await emailService.cleanupExpiredTokens();

      expect(result).toBe(0);
    });

    it('should handle database errors during cleanup', async () => {
      mockPool.query.mockRejectedValue(new Error('Cleanup failed'));

      await expect(emailService.cleanupExpiredTokens()).rejects.toThrow('Cleanup failed');
    });
  });

  describe('Email Template Generation', () => {
    it('should generate correct email template for guest booking', async () => {
      // Access private method for testing
      const emailServiceInstance = new EmailService();
      const template = (emailServiceInstance as any).createBookingAccessTemplate(
        'test-booking-123',
        'https://test.com/access/token123',
        'John Doe',
        'guest'
      );

      expect(template.subject).toContain('test-booking-123');
      expect(template.htmlContent).toContain('John Doe');
      expect(template.htmlContent).toContain('Guest Booking');
      expect(template.htmlContent).toContain('https://test.com/access/token123');
      expect(template.textContent).toContain('John Doe');
      expect(template.textContent).toContain('https://test.com/access/token123');
    });

    it('should generate correct email template for user booking', async () => {
      const emailServiceInstance = new EmailService();
      const template = (emailServiceInstance as any).createBookingAccessTemplate(
        'user-booking-456',
        'https://test.com/access/token456',
        'Jane Smith',
        'user',
        'janesmith'
      );

      expect(template.subject).toContain('user-booking-456');
      expect(template.htmlContent).toContain('Jane Smith');
      expect(template.htmlContent).toContain('janesmith');
      expect(template.htmlContent).toContain('Account Holder');
      expect(template.htmlContent).toContain('logging into your account');
      expect(template.textContent).toContain('janesmith');
    });

    it('should include security warnings in email template', async () => {
      const emailServiceInstance = new EmailService();
      const template = (emailServiceInstance as any).createBookingAccessTemplate(
        'security-test',
        'https://test.com/access/security',
        'Security Test',
        'guest'
      );

      expect(template.htmlContent).toContain('will expire in 24 hours');
      expect(template.htmlContent).toContain('Do not share this link');
      expect(template.htmlContent).toContain('didn\'t request this access');
      expect(template.textContent).toContain('will expire in 24 hours');
      expect(template.textContent).toContain('Do not share this link');
    });
  });

  describe('Token Generation', () => {
    it('should generate access tokens with correct payload', async () => {
      const emailServiceInstance = new EmailService();
      const mockSign = vi.fn().mockReturnValue('generated-jwt-token');
      (jwt.sign as any).mockImplementation(mockSign);

      const token = (emailServiceInstance as any).generateAccessToken(
        'test-booking',
        'test@example.com'
      );

      expect(mockSign).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: 'test-booking',
          email: 'test@example.com',
          purpose: 'guest_booking_access',
          timestamp: expect.any(Number)
        }),
        expect.any(String),
        { expiresIn: '24h' }
      );
      expect(token).toBe('generated-jwt-token');
    });

    it('should generate access links with correct format', async () => {
      const emailServiceInstance = new EmailService();
      const link = (emailServiceInstance as any).generateAccessLink('test-token-123');

      expect(link).toBe('https://test-frontend.com/guest-booking/test-token-123');
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle malformed booking data gracefully', async () => {
      // Mock booking query returning malformed data
      const malformedResult = {
        rows: [{
          booking_id: null,
          first_name: '',
          email: 'invalid-email'
        }]
      };

      mockConnection.query
        .mockResolvedValueOnce(malformedResult)
        .mockResolvedValueOnce({ rows: [] });

      const result = await emailService.sendBookingAccessEmail('malformed-booking', 'test@example.com');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should handle database connection failures during transaction', async () => {
      mockConnection.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN') return Promise.resolve();
        if (sql.includes('SELECT')) throw new Error('Connection lost');
        return Promise.resolve();
      });

      const result = await emailService.sendBookingAccessEmail('test-booking', 'test@example.com');

      expect(result.success).toBe(false);
      expect(mockConnection.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should handle concurrent token generation requests', async () => {
      // Mock scenario where multiple tokens might be generated simultaneously
      const guestBookingResult = {
        rows: [{
          booking_id: 'concurrent-booking',
          first_name: 'Concurrent',
          last_name: 'User',
          email: 'concurrent@example.com',
          booking_type: 'guest'
        }]
      };

      mockConnection.query
        .mockResolvedValueOnce(guestBookingResult)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'access-concurrent' }] });

      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'concurrent-message' });
      emailService['transporter'] = { sendMail: mockSendMail } as any;

      // Simulate concurrent requests
      const promises = [
        emailService.sendBookingAccessEmail('concurrent-booking', 'concurrent@example.com'),
        emailService.sendBookingAccessEmail('concurrent-booking', 'concurrent@example.com')
      ];

      const results = await Promise.all(promises);

      // At least one should succeed
      expect(results.some(r => r.success)).toBe(true);
    });
  });

  describe('Integration with Environment Configuration', () => {

    it('should use correct JWT secret for token operations', async () => {
      const emailServiceInstance = new EmailService();
      
      // Mock JWT operations to verify correct secret is used
      const mockSign = vi.fn().mockReturnValue('test-token');
      (jwt.sign as any).mockImplementation(mockSign);

      (emailServiceInstance as any).generateAccessToken('test', 'test@example.com');

      expect(mockSign).toHaveBeenCalledWith(
        expect.any(Object),
        'test-jwt-secret',
        expect.any(Object)
      );
    });

    it('should use correct frontend URL for access links', () => {
      const emailServiceInstance = new EmailService();
      const link = (emailServiceInstance as any).generateAccessLink('test-token');

      expect(link).toContain('https://test-frontend.com');
    });
  });
});