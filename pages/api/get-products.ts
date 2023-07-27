import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Stripe with your secret key
const stripe = new Stripe("sk_test_51NWlFcBvnwuagBF32v2nEfSPedUdPO85zrv6r7qgRHn5GecwtAcEZDQgSTevowiAWk1TDnJjzt9bz5Y3XgTNBpHC00zTwnmGeN", { apiVersion: '2022-11-15' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch all products.
      const products = await stripe.products.list();

      // Fetch all prices.
      const prices = await stripe.prices.list();

      const productsWithPrices = products.data.map((product) => {
        const price = prices.data.find((price) => price.product === product.id);

        if (!price) {
          return null;
        }

        return {
          name: product.name,
          price: price.unit_amount,
          priceId: price.id,
        };
      }).filter(product => product);  // Filter out any null products

      res.status(200).json(productsWithPrices);
    } catch (error) {
    res.status(500).json({ statusCode: 500, message: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}