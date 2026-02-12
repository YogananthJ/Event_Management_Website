import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import { handleError } from '@/lib/utils'

export async function GET() {
  try {
    await requireAdmin()
    await connectToDatabase()
    const events = await Event.find().sort({ createdAt: -1 })
    return NextResponse.json({ data: events })
  } catch (error: any) {
    if (error.status === 403) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    handleError(error)
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    await connectToDatabase()
    // generate unique code
    const generateCode = (len = 8) => Math.random().toString(36).slice(2, 2 + len).toUpperCase()
    let code = generateCode()
    // ensure uniqueness
    while (await Event.findOne({ code })) code = generateCode()

    const event = await Event.create({
      ...body,
      code,
      createdBy: admin._id,
      availableSeats: body.totalSeats || 0,
    })

    return NextResponse.json({ data: event, code })
  } catch (error: any) {
    if (error.status === 403) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    handleError(error)
  }
}
