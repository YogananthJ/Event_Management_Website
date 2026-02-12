import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import { handleError } from '@/lib/utils'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const event = await Event.findById(params.id)
    if (!event || !event.isPublished) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json({ data: event })
  } catch (error) {
    handleError(error)
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Admin-only API should call /api/admin/events/:id
    return NextResponse.json({ message: 'Use admin route' }, { status: 403 })
  } catch (error) {
    handleError(error)
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ message: 'Use admin route' }, { status: 403 })
  } catch (error) {
    handleError(error)
  }
}
