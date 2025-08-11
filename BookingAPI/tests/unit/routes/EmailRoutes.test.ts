// tests/unit/routes/EmailRoutes.test.ts
import request from 'supertest';
import express from 'express';

// Mock the emailService module - this gets hoisted
vi.mock('../../../src/services/emailService', () => ({
  emailService: {
    sendBookingAccessEmail: vi.fn(),
    verifyGuestAccessToken: vi.fn(),
    markTokenAsUsed: vi.fn()
  },
  EmailService: vi.fn(),
  createGuestAccessTable: vi.fn()
}));

// Mock the booking repository - this gets hoisted
vi.mock('../../../src/repos/bookingRepo', () => ({
  getBookingWithContactById: vi.fn()
}));

// Import after mocking
import emailRoutes from '../../../src/routes/EmailRoutes';
import { emailService } from '../../../src/services/emailService';
import * as bookingRepo from '../../../src/repos/bookingRepo';

describe('Email Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/email', emailRoutes);

  // Clear all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/email/send-booking-access', () => {
    it('should return 400 if booking_id or email missing', async () => {
      const res = await request(app)
        .post('/api/email/send-booking-access')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Booking ID and email are required/);
    });

    it('should return 400 if email format invalid', async () => {
      const res = await request(app)
        .post('/api/email/send-booking-access')
        .send({ booking_id: '1', email: 'bademail' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid email format/);
    });

    it('should send email successfully', async () => {
      (emailService.sendBookingAccessEmail as any).mockResolvedValue({
        success: true,
        message: 'Email sent',
        accessToken: 'test-token'
      });
      
      const res = await request(app)
        .post('/api/email/send-booking-access')
        .send({ booking_id: '1', email: 'test@example.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Email sent');
      expect(res.body.sent).toBe(true);
      expect(emailService.sendBookingAccessEmail).toHaveBeenCalledWith('1', 'test@example.com');
    });

    it('should handle email sending failure', async () => {
      (emailService.sendBookingAccessEmail as any).mockResolvedValue({
        success: false,
        message: 'Failed to send'
      });
      
      const res = await request(app)
        .post('/api/email/send-booking-access')
        .send({ booking_id: '1', email: 'test@example.com' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Failed to send');
    });

    it('should handle service error', async () => {
      (emailService.sendBookingAccessEmail as any).mockRejectedValue(new Error('Service error'));
      
      const res = await request(app)
        .post('/api/email/send-booking-access')
        .send({ booking_id: '1', email: 'test@example.com' });
      
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to send access email');
      expect(res.body.details).toBe('Service error');
    });
  });

  describe('GET /api/email/guest-booking/:token', () => {
    it('should return 404 if token missing', async () => {
      const res = await request(app).get('/api/email/guest-booking/');
      expect(res.status).toBe(404); // Express returns 404 for missing route params
    });

    it('should return 401 if token invalid', async () => {
      (emailService.verifyGuestAccessToken as any).mockResolvedValue({
        valid: false,
        message: 'Invalid token'
      });
      
      const res = await request(app).get('/api/email/guest-booking/abc123');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
      expect(emailService.verifyGuestAccessToken).toHaveBeenCalledWith('abc123');
    });

    it('should return 404 if booking not found', async () => {
      (emailService.verifyGuestAccessToken as any).mockResolvedValue({
        valid: true,
        bookingId: '1',
        email: 'test@example.com'
      });
      (bookingRepo.getBookingWithContactById as any).mockResolvedValue(null);

      const res = await request(app).get('/api/email/guest-booking/abc123');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Booking not found');
      expect(bookingRepo.getBookingWithContactById).toHaveBeenCalledWith('1');
    });

    it('should return 403 if email mismatch', async () => {
      (emailService.verifyGuestAccessToken as any).mockResolvedValue({
        valid: true,
        bookingId: '1',
        email: 'different@example.com'
      });
      (bookingRepo.getBookingWithContactById as any).mockResolvedValue({
        contact_email: 'test@example.com',
        booking_id: '1'
      });

      const res = await request(app).get('/api/email/guest-booking/abc123');
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Access denied/);
    });

    it('should return booking details if valid', async () => {
      (emailService.verifyGuestAccessToken as any).mockResolvedValue({
        valid: true,
        bookingId: '1',
        email: 'test@example.com'
      });
      (bookingRepo.getBookingWithContactById as any).mockResolvedValue({
        contact_email: 'test@example.com',
        booking_id: '1',
        bookingData: 'data'
      });

      const res = await request(app).get('/api/email/guest-booking/abc123');
      expect(res.status).toBe(200);
      expect(res.body.booking.bookingData).toBe('data');
      expect(res.body.message).toMatch(/Booking details retrieved successfully/);
      expect(res.body.access_valid_until).toBeDefined();
    });

    it('should handle service error in token verification', async () => {
      (emailService.verifyGuestAccessToken as any).mockRejectedValue(new Error('Token verification error'));
      
      const res = await request(app).get('/api/email/guest-booking/abc123');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to retrieve booking details');
      expect(res.body.details).toBe('Token verification error');
    });
  });

  describe('POST /api/email/resend-booking-access', () => {
    it('should return 400 if booking_id or email missing', async () => {
      const res = await request(app)
        .post('/api/email/resend-booking-access')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Booking ID and email are required/);
    });

    it('should return 400 if only booking_id provided', async () => {
      const res = await request(app)
        .post('/api/email/resend-booking-access')
        .send({ booking_id: '1' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Booking ID and email are required/);
    });

    it('should return 400 if only email provided', async () => {
      const res = await request(app)
        .post('/api/email/resend-booking-access')
        .send({ email: 'test@example.com' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Booking ID and email are required/);
    });

    it('should resend email successfully', async () => {
      (emailService.sendBookingAccessEmail as any).mockResolvedValue({
        success: true,
        message: 'Email resent',
        accessToken: 'new-token'
      });
      
      const res = await request(app)
        .post('/api/email/resend-booking-access')
        .send({ booking_id: '1', email: 'test@example.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Access email resent successfully');
      expect(emailService.sendBookingAccessEmail).toHaveBeenCalledWith('1', 'test@example.com');
    });

    it('should handle resend failure', async () => {
      (emailService.sendBookingAccessEmail as any).mockResolvedValue({
        success: false,
        message: 'Failed to resend'
      });
      
      const res = await request(app)
        .post('/api/email/resend-booking-access')
        .send({ booking_id: '1', email: 'test@example.com' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Failed to resend');
    });

    it('should handle service error in resend', async () => {
      (emailService.sendBookingAccessEmail as any).mockRejectedValue(new Error('Resend service error'));
      
      const res = await request(app)
        .post('/api/email/resend-booking-access')
        .send({ booking_id: '1', email: 'test@example.com' });
      
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to resend access email');
      expect(res.body.details).toBe('Resend service error');
    });
  });
});