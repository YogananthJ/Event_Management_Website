import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import { requireAdmin } from '@/lib/auth'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    // ensure caller is admin
    await requireAdmin(req as any)

    const body = await req.json()
    const { clerkId } = body
    if (!clerkId) return NextResponse.json({ message: 'Missing clerkId' }, { status: 400 })

    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    user.role = 'admin'
    await user.save()

    return NextResponse.json({ message: 'User promoted', user: JSON.parse(JSON.stringify(user)) })
  } catch (err: any) {
    if (err?.status === 401) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    if (err?.status === 403) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    console.error('[POST /api/admin/users/approve] error:', err)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}
