

import {} from 'dotenv/config'
import Stripe from 'stripe';
import Fastify from 'fastify';

// Require the framework and instantiate it
const fastify = Fastify({ logger: true, formbody: true });
const stripe = new Stripe("sk_test_");


// Fetch the publishable key to initialize Stripe.js
fastify.get("/publishable-key", () => {
  return { publishable_key: "pk_test_" };
});

// Create a payment intent and return its client secret
fastify.post("/create-payment-intent", async (request, reply) => {
  const { totalCost } = request.body;
  console.log(totalCost);
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCost, // in cents
    
    currency: "SGD",
    payment_method_types: ["card"],
    
    
  });

  return { client_secret: paymentIntent.client_secret };
});

// Run the server
const start = async () => {
  try {
    await fastify.listen({ port: 5252, host: 'localhost' });
    console.log("Server listening ... ");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
