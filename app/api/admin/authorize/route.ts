import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    await requireAdmin()
    const { clerkUserId, role } = await req.json()
    if (!clerkUserId || !role) return NextResponse.json({ message: 'Invalid' }, { status: 400 })
    await connectToDatabase()
    const user = await User.findOneAndUpdate({ clerkId: clerkUserId }, { role }, { new: true, upsert: false })
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })
    return NextResponse.json({ data: user })
  } catch (error: any) {
    if (error.status === 403) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    handleError(error)
  }
}
