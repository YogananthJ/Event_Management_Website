import React from 'react'
import { requireAdmin } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database'
import Booking from '@/lib/database/models/booking.model'
import Event from '@/lib/database/models/event.model'

export default async function ParticipantsPage({ params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin()
    await connectToDatabase()
    const event = await Event.findById(params.id)
    if (!event) return (
      <div className="wrapper py-10">Event not found</div>
    )
    if (event.createdBy.toString() !== admin._id.toString()) return (
      <div className="wrapper py-10">Forbidden</div>
    )

    const bookings = await Booking.find({ eventId: event._id }).populate('userId', 'email clerkId')

    return (
      <section>
        <h2 className="h3-bold">Participants for {event.title}</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Payment</th>
                <th className="p-2 border">Stripe Payment Id</th>
                <th className="p-2 border">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: any, i: number) => (
                <tr key={b._id} className="odd:bg-white even:bg-slate-50">
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{b.userId?.email || 'N/A'}</td>
                  <td className="p-2 border">{b.paymentStatus}</td>
                  <td className="p-2 border">{b.stripePaymentId || '-'}</td>
                  <td className="p-2 border">{new Date(b.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  } catch (err) {
    return (
      <div className="wrapper py-10">Access denied</div>
    )
  }
}
