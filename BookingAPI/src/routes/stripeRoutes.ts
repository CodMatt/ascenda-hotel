import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import 'dotenv/config';

const router = Router();

// Initialize Stripe with proper typing
const stripe = new Stripe(process.env.STRIPE_SK as string, {
    apiVersion: '2025-07-30.basil', // Use a stable API version
});

// Fetch the publishable key to initialize Stripe.js
router.get("/publishable-key", (req: Request, res: Response) => {
    console.log('STRIPE_PK from env:', process.env.STRIPE_PK); // Debug log
    return res.json({ publishable_key: process.env.STRIPE_PK });
});

// Create a payment intent and return its client secret
router.post("/create-payment-intent", async (req: Request, res: Response) => {
    try {
        const { totalCost } = req.body;
        console.log('Received totalCost:', totalCost);
        
        // Validate input
        if (!totalCost || isNaN(totalCost)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalCost, // assuming this is already in cents
            currency: "SGD",
            payment_method_types: ["card"],
        });
        
        return res.json({ client_secret: paymentIntent.client_secret });
    } catch (err: any) {
        console.error('Stripe error:', err);
        return res.status(500).json({
            error: err.message || 'Failed to create payment intent'
        });
    }
});

export default router;