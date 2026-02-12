"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const LoginChoice = () => {
  const router = useRouter()
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Use pattern-based validation: any email containing '.host@' is considered an organizer

  function handleUser() {
    router.push('/sign-in')
  }

  function handleAdminClick() {
    setShowAdminForm(true)
    setError(null)
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!normalized) {
      setError('Please enter your email')
      return
    }

    // Server-side validate admin email pattern
    try {
      const res = await fetch('/api/auth/validate-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data?.error || 'Only verified host emails can log in as Admin')
        return
      }

      // proceed to Clerk sign-in; include query params for UX
      router.push(`/sign-in?role=admin&email=${encodeURIComponent(normalized)}`)
    } catch (err:any) {
      setError(err?.message || 'Validation failed')
    }
  }

  return (
    <div className="wrapper my-12 flex flex-col items-center">
      <div className="max-w-md w-full rounded-lg border bg-white p-8">
        <h3 className="h4-bold mb-4">Sign in</h3>
        <p className="mb-6">Choose how you'd like to sign in.</p>

        <div className="flex flex-col gap-3">
          <button onClick={handleUser} className="rounded bg-primary-500 px-4 py-2 text-white">Continue as User</button>
          <button onClick={handleAdminClick} className="rounded border px-4 py-2">Continue as Admin</button>
        </div>

        {showAdminForm && (
          <form onSubmit={handleAdminSubmit} className="mt-6 flex flex-col gap-3">
            <label className="text-sm">Admin Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded border px-3 py-2" placeholder="you@company.com" />
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" className="rounded bg-primary-500 px-4 py-2 text-white">Proceed</button>
              <button type="button" onClick={() => setShowAdminForm(false)} className="rounded border px-4 py-2">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginChoice
