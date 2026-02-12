import React from 'react'
import EventForm from '@/components/shared/EventForm'
import { requireAdmin } from '@/lib/auth'

export default async function AdminCreateEventPage() {
  try {
    const admin = await requireAdmin()
    // admin contains app user doc with clerkId
    const clerkId = (admin as any).clerkId

    return (
      <section>
        <h2 className="h3-bold">Create Event</h2>
        <div className="my-6">
          {/* EventForm is a client component */}
          {/* @ts-expect-error Server -> Client prop */}
          <EventForm userId={clerkId} type="Create" />
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
