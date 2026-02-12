import { getAuth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { connectToDatabase } from './database'
import User from './database/models/user.model'

export const getCurrentUser = async (req?: NextRequest) => {
  const { userId } = getAuth(req)
  if (!userId) return null
  await connectToDatabase()
  const user = await User.findOne({ clerkId: userId })
  return user
}

export const requireAuth = async (req?: NextRequest) => {
  const { userId } = getAuth(req)
  if (!userId) {
    const err: any = new Error('Unauthorized')
    err.status = 401
    throw err
  }
  await connectToDatabase()

  let user = await User.findOne({ clerkId: userId })

  // If the local user record doesn't exist yet (webhook may not have fired),
  // try to fetch the user from Clerk and create a local record.
  if (!user) {
    try {
      const remote = await clerkClient.users.getUser(userId)
      const email = (remote.emailAddresses && remote.emailAddresses[0]?.emailAddress) || remote.primaryEmailAddress?.emailAddress || ''

      const newUser = {
        clerkId: userId,
        email,
        username: remote.username || undefined,
        firstName: remote.firstName || undefined,
        lastName: remote.lastName || undefined,
        photo: remote.profileImageUrl || undefined,
        role: email && email.includes('.host@') ? 'admin' : 'user'
      }

      user = await User.create(newUser)
    } catch (err) {
      const e: any = new Error('Unauthorized')
      e.status = 401
      throw e
    }
  }

  return user
}

export const requireAdmin = async (req?: NextRequest) => {
  const user = await requireAuth(req)
  if (user.role !== 'admin') {
    const err: any = new Error('Forbidden')
    err.status = 403
    throw err
  }
  return user
}

export const requireHost = async (req?: NextRequest) => {
  const user = await requireAuth(req)

  // Approve hosts by email pattern: any address containing '.host@'
  const email = (user.email || '').toLowerCase()
  if (!email.includes('.host@')) {
    const err: any = new Error('Forbidden')
    err.status = 403
    throw err
  }

  return user
}
