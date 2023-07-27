import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'micro-cors'
import Stripe from 'stripe'
import { buffer } from 'micro'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

export const config = {
  api: {
    bodyParser: false,
  },
}

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.log(`❌ Error message: ${errorMessage}`)
      res.status(400).send(`Webhook Error: ${errorMessage}`)
      return
    }

    console.log('✅ Success:', event.id)

    let subscription: Stripe.Subscription
    let status: Stripe.Subscription.Status

    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object as Stripe.Subscription
        status = subscription.status
        console.log(`Subscription status is ${status}.`)
        break
      case 'customer.subscription.deleted':
        subscription = event.data.object as Stripe.Subscription
        status = subscription.status
        console.log(`Subscription status is ${status}.`)
        break
      case 'customer.subscription.created':
        subscription = event.data.object as Stripe.Subscription
        status = subscription.status
        console.log(`Subscription status is ${status}.`)
        break
      case 'customer.subscription.updated':
        subscription = event.data.object as Stripe.Subscription
        status = subscription.status
        console.log(`Subscription status is ${status}.`)
        break
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`💰 PaymentIntent status: ${paymentIntent.status}`)
        break
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent
        console.log(`❌ Payment failed: ${paymentIntentFailed.last_payment_error?.message}`)
        break
      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge
        console.log(`💵 Charge id: ${charge.id}`)
        break
      default:
        console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default cors(webhookHandler as any)
