'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'

interface Props {
  dealId: string
}

export default function DeleteDealButton({ dealId }: Props) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/deals/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dealId }),
      })
      
      if (!res.ok) throw new Error('Failed to delete deal')
      
      // Redirect to the main deals page and refresh data
      router.push('/deals')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Failed to delete deal")
    } finally {
      setLoading(false)
    }
  }

  if (confirm) {
    return (
      <div className="join">
        <button
          className="btn btn-error btn-sm join-item"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button
          className="btn btn-ghost btn-sm join-item border border-base-300"
          onClick={() => setConfirm(false)}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      className="btn btn-outline btn-error btn-sm gap-2"
      onClick={() => setConfirm(true)}
    >
      <TrashIcon className="w-4 h-4" /> Delete
    </button>
  )
}