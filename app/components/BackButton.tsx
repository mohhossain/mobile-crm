'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const BackButton = () => {
    const router = useRouter()

  return (
    <div>
        <button
            className="btn btn-sm btn-ghost fixed top-4 left-4 z-50"
            onClick={() => router.back()}
            aria-label="Go back"
        >
            ← Back
        </button>
    </div>
  )
}

export default BackButton