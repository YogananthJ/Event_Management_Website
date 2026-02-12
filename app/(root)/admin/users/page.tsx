import React from 'react'

import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import { requireAdmin } from '@/lib/auth'
import ApproveButton from '@/components/shared/ApproveButton'

async function getPendingUsers() {
  await connectToDatabase()
  const users = await User.find({ role: 'pending_admin' }).lean()
  return JSON.parse(JSON.stringify(users))
}

export default async function Page() {
  await requireAdmin(undefined as any)
  const users = await getPendingUsers()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Organizers</h1>
      <ul>
        {users.map((u: any) => (
          <li key={u._id} className="mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{u.email}</div>
                <div className="text-sm text-muted-foreground">{u.firstName || ''} {u.lastName || ''}</div>
              </div>
              <div>
                <ApproveButton clerkId={u.clerkId} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
