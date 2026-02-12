import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import Booking from '@/lib/database/models/booking.model'
import { getAuth } from '@clerk/nextjs/server'
import User from '@/lib/database/models/user.model'
import Stripe from 'stripe'
import { handleError } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth()
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    await connectToDatabase()
    const appUser = await User.findOne({ clerkId: userId })
    if (!appUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })
    const event = await Event.findById(params.id)
    if (!event || !event.isPublished) return NextResponse.json({ message: 'Event not found' }, { status: 404 })
    if (event.availableSeats <= 0) return NextResponse.json({ message: 'Sold out' }, { status: 400 })

    if (event.eventType === 'FREE') {
      // create booking directly
      const booking = await Booking.create({ userId: appUser._id, eventId: event._id, paymentStatus: 'free' })
      event.availableSeats = event.availableSeats - 1
      await event.save()
      return NextResponse.json({ data: booking })
    }

    // Paid event: create checkout session
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: { currency: 'usd', product_data: { name: event.title }, unit_amount: Math.round(event.price * 100) }, quantity: 1 }],
      success_url: `${domain}/events/${event._id}?payment=success`,
      cancel_url: `${domain}/events/${event._id}?payment=cancel`,
      metadata: { eventId: event._id.toString(), clerkUserId: userId }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    handleError(error)
  }
}
