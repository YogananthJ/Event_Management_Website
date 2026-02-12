import React from 'react'
import { getAuth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/database'
import Booking from '@/lib/database/models/booking.model'
import User from '@/lib/database/models/user.model'
import Event from '@/lib/database/models/event.model'
import Link from 'next/link'

export default async function MyEventsPage() {
  const { userId } = getAuth()
  if (!userId) {
    return (
      <div className="wrapper py-10">
        <h2 className="h3-bold">Please sign in to view your events</h2>
        <Link href="/login" className="underline">Sign in</Link>
      </div>
    )
  }

  await connectToDatabase()
  const appUser = await User.findOne({ clerkId: userId })
  if (!appUser) {
    return (
      <div className="wrapper py-10">No user record found.</div>
    )
  }

  const bookings = await Booking.find({ userId: appUser._id }).populate('eventId')

  return (
    <section className="wrapper py-8">
      <h2 className="h3-bold">My Events</h2>
      <div className="mt-6">
        {bookings.length === 0 ? (
          <p>No registered events yet.</p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b: any) => (
              <li key={b._id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{b.eventId?.title || 'Event'}</div>
                  <div className="text-sm text-muted-foreground">{b.paymentStatus} {b.eventId?.eventType === 'PAID' ? '· Paid' : '· Free'}</div>
                </div>
                <div className="flex gap-3">
                  <Link href={`/events/${b.eventId?._id}`} className="underline">View</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
