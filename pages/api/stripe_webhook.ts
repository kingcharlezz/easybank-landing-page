import Stripe from 'stripe';
import { buffer } from 'micro';
import Cors from 'micro-cors';
import admin from 'firebase-admin';
import { firestore } from 'firebase-admin'; 
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage, ServerResponse } from 'http';

const endpointSecret = process.env.WEBHOOK_SIGNING_SECRET;


// Initialize Firestore
if (!admin.apps.length) {
  const serviceAccount = {
  "type": "service_account",
  "project_id": "notescribe-6867a",
  "private_key_id": "274028eca85700400755b8ef89c266d4085dbc0c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDiOPAyG06MJZlj\ngSyCmTwiv4fJIcS9HWkJQHUdymtuaYhR9MMh6C7FrIKVM8b6I1N5WZ2J4TX4ujpl\ntM5q9gra+3fgsz4SqcnNJv9wX30jwt34czX0mDrVUZPFOWiW3LfQAd0zaGEfiiLQ\nw3CfRH8ToMYwq1jRfT3Te455Lm0uVWSboFknqFcOTKMAodutyLLcm/U2Wx8uvWJj\npmBqt0JzduKfKZxovz6/YX5RJIDTqcwUWn6Yopgy/L0ZBvovpAtxFq5o/RVp9ALe\nB3G63cQtZA6uwWtc6UbH47DU2XJbLGfg9QNmOnZAnAa70uIjAyN6gvcd4LXIdAB4\n5Miw61phAgMBAAECggEAK9G4oRQOAnKUBCS00PVKozZzYF/UoocsXdjo9qTLa38w\noyNkmtBFIxAX2TvGypQGKsbTj64ajLvR7Pp5U1mmX6V/InzFxMqzprPrncI5VLB9\n247BgEfueXyMQZMtsa8+QaHizX7l9TyGIucAjTEw5kXpreq60RVP4QOZZNq71lHh\n6HK4popUY99azxi5Cb4B4D/PBl5jP40y7qzMpi0+8pbiYUIH35ZW1pV2dSTXp/UM\n4hD12DFgoGc4BADqeOgn6MSgkjMH5tXdv4wa2cTxj53hud+7ift0PbadiGFsL+PR\nK50jT/ZGA8h27t8o2vRy8y/6WJna7rTQwLv0aTzCWwKBgQDx8yYV42z6HxKeNVk6\nV6wHeAuu1ALHTQHcV8XVIgH81mRxHp0xl455IVD+6g576hz+Ukm0mB+FLH4p0Afr\nEj72cTnsGIYeXLXmfu5OIgig1oc+S34JlJXgvmDPtlDAqwGuzacp2CH+SalV83NP\nIYJYjzEEe/w1IGUWoCGiNAM49wKBgQDvW/wKWim9OVzfU4QT10Fo8zc0kFDUOlV2\ndeBLqPvUvIt4tW0WHd5GAdc+tRKiouS94olN3aPg2J6SF0H7KfdFR2a4J286sSDH\nAne4fJgMRJfWsdJPz2JTwMt2cz44CgwwqZYq19JPkhEjHky5bicLeoWXwHNPFjDn\niWTcO2dJZwKBgQCyJ8lWerUm47Rw3HWMWTwp78IihKhbGqARIGxiyPzPsQoapWE4\nQBG/rcGXQr9RjQy2U99D5HPpOt7XaQA7np7QFoWBDHnNZ5TlWXed/r99txm0zB/N\nbCSEbYqZx/RkOkct8O5zCFvXg2P2DyJMFS+GiEGevLD0aZsl8tlxN31b9wKBgQC/\nLbAksJkv6vYz5efTVRWIduJ8GFyG9kS2hjXtGH50D1gyxG3pwVd8gRHjowrMXeDn\njV3vlHzFJR+aPftUWdOHQR1ZLx4XOcydR2pKLzHecpb4QzVgy5qUnKOl6ywh5FyS\nLZGkjJcNOPR5IUVUwhdrgqPbbjprS6Up+cJWaRf5NwKBgFYRjgmLfe2U21ssnx6H\n5tVo960Zqvw45GxalgxvlGICF/5af6qUgJGQ0ukW6bKBs3FNfSQg/aZLCxQpAegt\nCEhft8qQjOPkb4EwfGTjLc9AdsugA+k0jHVzt7RKecAqw6nGH4xSEYr5/nJQEHwG\n1/i8Y9m0qb7HZICBGb2H/hCt\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-maa2j@notescribe-6867a.iam.gserviceaccount.com",
  "client_id": "116335573237187139699",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-maa2j%40notescribe-6867a.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
  };
  
  admin.initializeApp({
    credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        privateKey: serviceAccount.private_key,
        clientEmail: serviceAccount.client_email
    }),
    databaseURL: 'https://notescribe-6867a.firebaseio.com'
  });
}


const db = firestore();

const stripe = new Stripe("sk_test_51NWlFcBvnwuagBF32v2nEfSPedUdPO85zrv6r7qgRHn5GecwtAcEZDQgSTevowiAWk1TDnJjzt9bz5Y3XgTNBpHC00zTwnmGeN", { apiVersion: '2022-11-15' });

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookHandler = async (req: IncomingMessage, res: ServerResponse) => {
  const nextReq = req as NextApiRequest;
  const nextRes = res as NextApiResponse;

  if (nextReq.method === 'POST') {
    const buf = await buffer(nextReq);
    const sig = nextReq.headers['stripe-signature'];

    let event;
    try {
      if (!sig) throw new Error('Missing Stripe Signature');
      event = stripe.webhooks.constructEvent(buf.toString(), sig, endpointSecret || '');
    } catch (err) {
      nextRes.status(400).send(`Webhook error: ${(err as Error).message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
    
      const stripeCustomerId = session.customer ? session.customer : '';
      
      // Query Firestore for the user document with the matching stripeCustomerId
      const userSnap = await db.collection('users').where('stripeCustomerId', '==', stripeCustomerId).get();
  
      // Ensure we found a user
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        
        let paymentTier;
        if (session.amount_subtotal === 499) {
          paymentTier = 'Premium';
        } else if (session.amount_subtotal === 999) {
          paymentTier = 'PremiumPlus';
        }
    
        if (paymentTier) {
          await userDoc.ref.collection('accountinfo').doc('info').set({
            paymentTier: paymentTier,
          }, { merge: true });
    
          console.log("Payment was successful. ", session);
        } else {
          console.log("No matching payment tier for amount: ", session.amount_subtotal);
        }
        
      } else {
        console.log("No user found with the provided Stripe customer ID: ", stripeCustomerId);
      }
    }
    // Include HTTP method in the response body
    nextRes.json({ received: true, method: nextReq.method });
  } else {
    nextRes.setHeader('Allow', 'POST');
    nextRes.status(405).send(`Method not allowed. Current method: ${nextReq.method}`);
  }
};

export default cors(webhookHandler);
