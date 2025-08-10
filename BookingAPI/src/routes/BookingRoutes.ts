import express from 'express';
import * as bookingRepo from '../repos/bookingRepo';
import * as nonAccountRepo from '../repos/nonAccountRepo';
import db from '../models/db';
import { IBooking } from '../models/booking'; 
import { INonAcct } from '../models/nonAcct';
import { validateBookingCreation } from '@src/common/util/validators';

import { authenticateJWT } from '@src/common/util/auth';
import { emailService } from '@src/services/emailService';
const router = express.Router();

// CREATE booking
router.post('/',validateBookingCreation,async (req:any, res:any) => {
    const connection = await db.getPool().connect();
    try {
        await connection.query('BEGIN');

        const {
            id,
            dest_id,
            hotel_id,
            nights,
            start_date,
            end_date,
            adults,
            children,
            msg_to_hotel,
            price,
            user_ref,
            first_name,
            last_name,
            salutation,
            phone_num,
            email
        } = req.body;

        const bookingId = id || `booking-${Date.now()}`;
        const now = new Date();

        const booking: IBooking = {
            id: bookingId,
            dest_id,
            hotel_id,
            nights: nights || 1,
            start_date,
            end_date,
            adults: adults || 1,
            children: children || 0,
            msg_to_hotel: msg_to_hotel || '',
            price: price || 0,
            user_ref: user_ref || null,
            updated_at: now,
            created: now
        };

        
        await bookingRepo.createBooking(booking, connection);
        if (booking.user_ref === null) {
            if (!first_name || !last_name || !salutation || !phone_num || !email) {
                return res.status(400).json({ error: 'Fill in customer details' });
            }

            const noAcctInfoDetails: INonAcct = {
                booking_id: bookingId,
                first_name,
                last_name,
                salutation,
                phone_num,
                email
            };

            await nonAccountRepo.addNoAcctInfo(noAcctInfoDetails, connection);
        }


        await connection.query('COMMIT');
        res.status(201).json({ message: 'Booking created', booking_id: bookingId });
    } catch (error) {
        await connection.query('ROLLBACK');
        console.error('Transaction failed:', error);
        res.status(500).json({ error: 'Failed to create booking', details: error });
    } finally {
        connection.release();
    }
});


// READ all bookings
router.get('/', async (_req, res) => {
    try {
        const bookings = await bookingRepo.getAllBookings();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings', details: error });
    }
});

// READ booking by ID
router.get('/details/:id', async (req, res) => {
    try {
        const booking = await bookingRepo.getBookingById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booking', details: error });
    }
});


// UPDATE booking - no modification without authentication
router.put('/update/:id', async (req, res) => {
    try {
        // Only allow valid IBooking fields to be updated
        const allowedFields = [
            'dest_id', 'hotel_id', 'nights', 'start_date', 'end_date',
            'adults', 'children', 'msg_to_hotel', 'price'
        ];
        const updates: Partial<IBooking> = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key as keyof IBooking] = req.body[key];
            }
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        updates.updated_at = new Date(); // Update the timestamp
        const result = await bookingRepo.updateBooking(req.params.id, updates);
        res.status(200).json({ message: 'Booking updated', result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update booking', details: error });
    }
});

/**
 * READ booking by ID with contact information (public)
 */
router.get('/details-with-contact/:id', async (req, res) => {
    try {
        const booking = await bookingRepo.getBookingWithContactById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booking with contact', details: error });
    }
});

// READ all bookings with contact information (public - consider adding authentication for this)
router.get('/all-with-contact', async (_req, res) => {
    try {
        const bookings = await bookingRepo.getAllBookingsWithContact();
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings with contact', details: error });
    }
});

// READ bookings by hotel with contact information (public)
router.get('/hotel-with-contact/:hotel_id', async (req, res) => {
    try {
        const bookings = await bookingRepo.getBookingsWithContactByHotel(req.params.hotel_id);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hotel bookings with contact', details: error });
    }
});

// Request guest booking access via email
router.post('/request-guest-access', async (req, res) => {
  try {
    const { booking_id, email } = req.body;
    
    if (!booking_id || !email) {
      return res.status(400).json({ 
        error: 'Booking ID and email are required' 
      });
    }
    
    // This will call the email service
    const result = await emailService.sendBookingAccessEmail(booking_id, email);
    
    if (result.success) {
      res.status(200).json({
        message: 'If a booking exists with this email, an access link has been sent.',
        // Always return success message for security (don't reveal if booking exists)
      });
    } else {
      // Still return success for security, but log the actual error
      console.error('Guest access request failed:', result.message);
      res.status(200).json({
        message: 'If a booking exists with this email, an access link has been sent.'
      });
    }
    
  } catch (error) {
    console.error('Error in request-guest-access route:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



router.use(authenticateJWT);// All routes below this line will require authentication

// get booking by user
router.get('/my-booking', async (req, res) => {
    try {
        const userId = req.user?.userId
        console.log("User: "+userId)
        if(!userId){
            return res.status(401).json({error: 'User ID not found in token'});
        }
        const booking = await bookingRepo.getBookingByUser(userId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booking', details: error });
    }
});

// FIXED: Get specific booking for authenticated user
router.get('/my-booking/:id', async(req, res)=>{
    try{
        const userId = req.user?.userId;
        if(!userId){
            return res.status(401).json({error: 'User ID not found in token'});
        }
        
        const booking = await bookingRepo.getBookingById(req.params.id);
        if(!booking){
            return res.status(404).json({error: 'Booking not found or not owned by user'});
        }
        
        // Check if booking belongs to the authenticated user
        if(booking.user_reference !== userId){
            return res.status(404).json({error: 'Booking not found or not owned by user'});
        }
        
        res.json(booking);
    }catch(error){
        res.status(500).json({error: 'Failed to fetch booking', details: error});
    }
});

// FIXED: DELETE booking with user ownership check
router.delete('/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?.userId; // For authenticated users
        const guestEmail = req.body?.email; // For guest bookings

        // First check if booking exists
        const booking = await bookingRepo.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Case 1: Booking belongs to authenticated user
        if (userId && booking.user_reference === userId) {
            const result = await bookingRepo.deleteBooking(bookingId);
            return res.json({ message: 'Booking deleted', result });
        }

        // Case 2: Guest booking (no user reference)
        if (!booking.user_reference) {
            if (!guestEmail) {
                return res.status(400).json({ error: 'Email required for guest booking deletion' });
            }

            // Verify guest details match
            const guestDetails = await nonAccountRepo.getGuestByBookingId(bookingId);
            if (!guestDetails || guestDetails.email !== guestEmail) {
                return res.status(403).json({ error: 'Invalid email for guest booking' });
            }

            const result = await bookingRepo.deleteBooking(bookingId);
            return res.json({ message: 'Guest booking deleted', result });
        }

        // If neither case matches
        return res.status(403).json({ error: 'Not authorized to delete this booking' });

    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to delete booking', 
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});



// Get user's bookings with contact information (protected)
router.get('/my-bookings-with-contact', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User ID not found in token' });
        }
        
        const bookings = await bookingRepo.getUserBookingsWithContact(userId);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user bookings with contact', details: error });
    }
});

export default router;