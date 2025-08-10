import express from 'express';
import { emailService } from '../services/emailService';
import * as bookingRepo from '../repos/bookingRepo';
import { validateIdParam } from '@src/common/util/validators';

const router = express.Router();

/******************************************************************************
 Email Routes for Guest Booking Access
******************************************************************************/

/**
 * Send access email for guest booking
 * POST /api/email/send-booking-access
 */
router.post('/send-booking-access', async (req, res) => {
  try {
    const { booking_id, email } = req.body;
    
    // Validate required fields
    if (!booking_id || !email) {
      return res.status(400).json({ 
        error: 'Booking ID and email are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
    
    const result = await emailService.sendBookingAccessEmail(booking_id, email);
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        // Don't send the actual token to frontend for security
        sent: true
      });
    } else {
      res.status(400).json({
        error: result.message
      });
    }
    
  } catch (error) {
    console.error('Error in send-booking-access route:', error);
    res.status(500).json({ 
      error: 'Failed to send access email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Verify guest access token and get booking details
 * GET /api/email/guest-booking/:token
 */
router.get('/guest-booking/:token', async (req, res) => {
  try {
    const accessToken = req.params.token;
    
    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Access token is required' 
      });
    }
    
    // Verify the access token
    const verification = await emailService.verifyGuestAccessToken(accessToken);
    
    if (!verification.valid) {
      return res.status(401).json({
        error: verification.message
      });
    }
    
    // Get booking details with contact information
    const booking = await bookingRepo.getBookingWithContactById(verification.bookingId!);
    
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }
    
    // Verify email matches (extra security check)
    if (booking.contact_email !== verification.email) {
      return res.status(403).json({
        error: 'Access denied: Email mismatch'
      });
    }
    
    // Optional: Mark token as used for single-use tokens
    // await emailService.markTokenAsUsed(accessToken);
    
    res.json({
      booking,
      access_valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      message: 'Booking details retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error in guest-booking route:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve booking details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Resend access email for guest booking
 * POST /api/email/resend-booking-access
 */
router.post('/resend-booking-access', async (req, res) => {
  try {
    const { booking_id, email } = req.body;
    
    if (!booking_id || !email) {
      return res.status(400).json({ 
        error: 'Booking ID and email are required' 
      });
    }
    
    const result = await emailService.sendBookingAccessEmail(booking_id, email);
    
    if (result.success) {
      res.status(200).json({
        message: 'Access email resent successfully'
      });
    } else {
      res.status(400).json({
        error: result.message
      });
    }
    
  } catch (error) {
    console.error('Error in resend-booking-access route:', error);
    res.status(500).json({ 
      error: 'Failed to resend access email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;