import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body?.email || '').toString().trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 })
    }

    // server-side pattern check: must include '.host@'
    if (!email.includes('.host@')) {
      return NextResponse.json({ ok: false, error: 'Only verified host emails can log in as Admin' }, { status: 403 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Invalid request' }, { status: 500 })
  }
}
