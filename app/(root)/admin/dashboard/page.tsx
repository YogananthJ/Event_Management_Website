import React from 'react'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  try {
    const admin = await requireAdmin()
    await connectToDatabase()
    const myEvents = await Event.find({ createdBy: admin._id }).sort({ createdAt: -1 })
    const totalEvents = myEvents.length
    const published = myEvents.filter(e => e.isPublished).length

    return (
      <section>
        <h2 className="h3-bold">Admin Dashboard</h2>
        <div className="my-4 grid grid-cols-2 gap-4">
          <div className="p-4 border">Total events: <strong>{totalEvents}</strong></div>
          <div className="p-4 border">Published: <strong>{published}</strong></div>
        </div>

        <div className="my-6">
          <h3 className="h4">My events</h3>
          <ul className="mt-3 space-y-2">
            {myEvents.map((ev: any) => (
              <li key={ev._id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-sm text-muted-foreground">Code: {ev.code} · Seats: {ev.availableSeats}/{ev.totalSeats}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/event/${ev._id}/participants`} className="underline">Participants</Link>
                  <Link href={`/events/${ev._id}`} className="underline">View</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  } catch (err) {
    return (
      <div className="py-10 wrapper">
        <h2 className="h3-bold">Access denied</h2>
      </div>
    )
  }
}
