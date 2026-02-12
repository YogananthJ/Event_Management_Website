import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import { handleError } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth'
import { getAuth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    await connectToDatabase()
    // Return only published public events for public listings
    const events = await Event.find({ isPublished: true, isPublic: true }).sort({ createdAt: -1 })
    return NextResponse.json({ data: events })
  } catch (error) {
    handleError(error)
  }
}

// POST /api/events - create an event (server-enforced admin only)
export async function POST(req: Request) {
  try {
    // Validate clerk session + admin role server-side
    // Debug: log getAuth result (only userId) to confirm Clerk session presence
    try {
      const auth = getAuth(req as any)
      console.debug('[POST /api/events] getAuth userId:', auth.userId)
    } catch (e) {
      console.debug('[POST /api/events] getAuth threw:', e)
    }

    // Debug: log incoming cookies to verify Clerk session cookie is sent
    try {
      const cookies = req.headers.get('cookie')
      console.debug('[POST /api/events] incoming cookies:', cookies)
    } catch (e) {
      console.debug('[POST /api/events] cannot read cookies:', e)
    }

    // enforce admin role for event creation
    const admin = await requireAdmin(req as any)

    // minimal debug: log presence of clerk mapping (no secrets)
    console.debug('[POST /api/events] admin._id present:', !!admin?._id)

    const body = await req.json()
    await connectToDatabase()

    // create a URL-friendly slug from title + random suffix
    const slugify = (s: string) => s
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    const makeSlug = (title: string) => {
      const base = slugify(title || 'event')
      const suffix = Math.random().toString(36).slice(2, 8)
      return `${base}-${suffix}`
    }

    let slug = body.urlSlug || makeSlug(body.title || 'event')
    // ensure uniqueness
    while (await Event.findOne({ urlSlug: slug })) {
      slug = makeSlug(body.title || 'event')
    }

    const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
    const url = `${base}/events/${slug}`

    // Normalize date/time fields: accept startDateTime/endDateTime from client
    if (body.startDateTime) {
      const sd = new Date(body.startDateTime)
      body.startDateTime = sd
      body.date = body.date || sd.toISOString().split('T')[0]
      body.time = body.time || sd.toISOString()
    }

    if (body.endDateTime) {
      const ed = new Date(body.endDateTime)
      body.endDateTime = ed
    }

    // ensure isFree is boolean
    if (typeof body.isFree === 'string') {
      body.isFree = body.isFree === 'true'
    }

    const event = await Event.create({
      ...body,
      url,
      urlSlug: slug,
      createdBy: admin._id,
      availableSeats: body.totalSeats || 0,
    })

    return NextResponse.json({ data: event })
  } catch (error: any) {
    if (error.status === 401) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    console.error('[POST /api/events] unexpected error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
