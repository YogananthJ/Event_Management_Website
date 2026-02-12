import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { connectToDatabase } from '@/lib/database'
import Booking from '@/lib/database/models/booking.model'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import mongoose from 'mongoose'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || ''
  const body = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err) {
    return NextResponse.json({ message: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const eventId = session.metadata?.eventId
    const clerkUserId = session.metadata?.clerkUserId
    const paymentId = session.payment_intent || session.id

    if (!eventId || !clerkUserId) return NextResponse.json({ received: true })

    await connectToDatabase()
    const appUser = await User.findOne({ clerkId: clerkUserId })
    if (!appUser) return NextResponse.json({ received: true })
    const conn = mongoose.connection
    const sessionDb = await conn.startSession()
    try {
      await sessionDb.withTransaction(async () => {
        const eventDoc = await Event.findById(eventId).session(sessionDb)
        if (!eventDoc) throw new Error('Event not found')
        if (eventDoc.availableSeats <= 0) throw new Error('Sold out')

        // Prevent double booking by ensuring no booking with same stripePaymentId
        const existing = await Booking.findOne({ stripePaymentId: paymentId }).session(sessionDb)
        if (existing) return

        const booking = await Booking.create([{ userId: appUser._id, eventId: eventDoc._id, stripePaymentId: paymentId, paymentStatus: 'paid' }], { session: sessionDb })
        eventDoc.availableSeats = eventDoc.availableSeats - 1
        await eventDoc.save({ session: sessionDb })
      })
    } finally {
      sessionDb.endSession()
    }
  }

  return NextResponse.json({ received: true })
}
