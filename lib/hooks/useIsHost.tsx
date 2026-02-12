"use client"

import { useMemo } from 'react'
import { useUser } from '@clerk/nextjs'

export default function useIsHost() {
  const { user, isLoaded } = useUser()

  const isHost = useMemo(() => {
    if (!isLoaded || !user) return false

    // Try several common Clerk user email properties
    const emails: string[] = []
    try {
      if ((user as any).primaryEmailAddress?.emailAddress) emails.push((user as any).primaryEmailAddress.emailAddress)
      if ((user as any).email) emails.push((user as any).email)
      if (Array.isArray((user as any).emailAddresses)) {
        for (const e of (user as any).emailAddresses) {
          if (e?.emailAddress) emails.push(e.emailAddress)
        }
      }
    } catch (e) {
      // ignore
    }

    const normalized = emails.map((s) => String(s || '').trim().toLowerCase()).filter(Boolean)

    // Consider user a host if any of their emails contains the substring '.host@'
    return normalized.some((e) => e.includes('.host@'))
  }, [user, isLoaded])

  return isHost
}
