import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database'
import Booking from '@/lib/database/models/booking.model'
import { handleError } from '@/lib/utils'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    await connectToDatabase()
    const bookings = await Booking.find({ eventId: params.id }).populate('userId', 'email clerkId')
    return NextResponse.json({ data: bookings })
  } catch (error: any) {
    if (error.status === 403) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    handleError(error)
  }
}
