import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import { handleError } from '@/lib/utils'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    await connectToDatabase()
    const event = await Event.findById(params.id)
    if (!event) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    if (event.createdBy.toString() !== admin._id.toString()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    Object.assign(event, body)
    if (body.totalSeats) event.availableSeats = body.totalSeats
    await event.save()
    return NextResponse.json({ data: event })
  } catch (error: any) {
    if (error.status === 403) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    handleError(error)
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin()
    await connectToDatabase()
    const event = await Event.findById(params.id)
    if (!event) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    if (event.createdBy.toString() !== admin._id.toString()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    await event.deleteOne()
    return NextResponse.json({ message: 'Deleted' })
  } catch (error: any) {
    if (error.status === 403) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    handleError(error)
  }
}
