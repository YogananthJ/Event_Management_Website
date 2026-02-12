import React from 'react'
import { requireAdmin } from '@/lib/auth'
import Event from '@/lib/database/models/event.model'
import { connectToDatabase } from '@/lib/database'
import Link from 'next/link'

export default async function AdminMyEventsPage() {
  try {
    const admin = await requireAdmin()
    await connectToDatabase()
    const myEvents = await Event.find({ createdBy: admin._id }).sort({ createdAt: -1 })

    return (
      <section>
        <h2 className="h3-bold">My Events</h2>
        <div className="mt-4">
          <ul className="space-y-3">
            {myEvents.map((ev: any) => (
              <li key={ev._id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-sm text-muted-foreground">{ev.date} {ev.time} · {ev.location}</div>
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
