import React from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin()
  } catch (err) {
    return (
      <div className="wrapper py-10">
        <h2 className="h3-bold">Access denied</h2>
        <p>You must be an administrator to access this section.</p>
        <Link href="/">Go home</Link>
      </div>
    )
  }

  return (
    <div className="wrapper my-8">
      <nav className="mb-6 flex gap-4">
        <Link href="/admin/dashboard" className="underline">Dashboard</Link>
        <Link href="/admin/create-event" className="underline">Create Event</Link>
        <Link href="/admin/my-events" className="underline">My Events</Link>
      </nav>
      <main>{children}</main>
    </div>
  )
}
