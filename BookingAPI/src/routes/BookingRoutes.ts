import express from 'express';
import * as bookingRepo from '../repos/bookingRepo';
import { IBooking } from '../models/booking'; // Add this import if IBooking is defined in models/IBooking.ts

const router = express.Router();

// CREATE booking
router.post('/', async (req, res) => {
    try {
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
            user_ref
        } = req.body;

        if (!dest_id || !hotel_id || !start_date || !end_date) {
            return res.status(400).json({ error: 'Missing required booking fields' });
        }

        const now = new Date();
        const booking: IBooking = {
            id: id || `booking-${Date.now()}`,
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

        const result = await bookingRepo.createBooking(booking);
        res.status(201).json({ message: 'Booking created', result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking', details: error });
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
router.get('/:id', async (req, res) => {
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

// get booking by user
router.get('/user/:id', async (req, res) => {
    try {
        const booking = await bookingRepo.getBookingByUser(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booking', details: error });
    }
});

// UPDATE booking
router.put('/:id', async (req, res) => {
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
        res.json({ message: 'Booking updated', result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update booking', details: error });
    }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
    try {
        const result = await bookingRepo.deleteBooking(req.params.id);
        res.json({ message: 'Booking deleted', result });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete booking', details: error });
    }
});

export default router;