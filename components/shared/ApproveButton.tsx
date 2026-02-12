'use client'
import React from 'react'

export default function ApproveButton({ clerkId }: { clerkId: string }) {
  const [loading, setLoading] = React.useState(false)

  async function handle() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId }),
        credentials: 'include',
      })
      if (res.ok) {
        window.location.reload()
      } else {
        const j = await res.json().catch(() => ({}))
        alert(j?.message || 'Failed to approve')
        setLoading(false)
      }
    } catch (err) {
      alert('Network error')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="px-3 py-1 bg-blue-600 text-white rounded"
    >
      {loading ? 'Approving...' : 'Approve'}
    </button>
  )
}
