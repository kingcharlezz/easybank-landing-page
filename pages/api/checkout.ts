import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import { firestore } from 'firebase-admin';

// Initialize Firestore
// ... Your existing Firestore initialization code ...

const db = firestore();
const stripe = new Stripe("sk_test_51NWlFcBvnwuagBF32v2nEfSPedUdPO85zrv6r7qgRHn5GecwtAcEZDQgSTevowiAWk1TDnJjzt9bz5Y3XgTNBpHC00zTwnmGeN", { apiVersion: '2022-11-15' });
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body) {
    res.status(400).send({ error: 'Invalid request body' });
    return;
  }
  
  const { priceId, userId } = req.body;

  // Check if userId is defined.
  if (!userId) {
    res.status(400).send({ error: 'UserId is missing' });
    return;
  }

  let stripeCustomerId;

  // Try to fetch the user's Stripe customer ID from Firestore.
  const userSnapshot = await db.collection('users').doc(userId).get();
  if (userSnapshot.exists && userSnapshot.data()) {
    stripeCustomerId = userSnapshot.data()!.stripeCustomerId;
  }

  // If the user doesn't have a Stripe customer ID yet, create a new customer in Stripe.
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create();
    stripeCustomerId = customer.id;

    // Store the new Stripe customer ID in Firestore.
    await db.collection('users').doc(userId).set({ stripeCustomerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/cancelled`,
  });

  res.send({
    sessionId: session.id,
  });
}

