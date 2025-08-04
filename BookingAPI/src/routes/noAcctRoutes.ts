import express from 'express';
import * as nonAccountRepo from '../repos/nonAccountRepo';


const router = express.Router();

// get by hotel id
router.get('/:HotelId', async (req, res) => {
    try {
        const bookings = await nonAccountRepo.getBookingsByHotel(req.params.HotelId);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings', details: error });
    }
});

export default router;