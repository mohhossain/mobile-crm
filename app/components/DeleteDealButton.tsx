'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
      router.back()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!confirm ? (
        <button
          className="btn btn-outline btn-error btn-sm"
          onClick={() => setConfirm(true)}
        >
          Delete
        </button>
      ) : (
        <div className="space-x-1">
          <button
            className="btn btn-error btn-sm"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Confirm'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setConfirm(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  )
}
