'use client'

import Link from 'next/link'
import Image from 'next/image'
import { $Enums } from '@prisma/client'
import {
  HandRaisedIcon,
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid'
import React from 'react'

interface deal {
  id: string
  title: string
  amount: number
  updatedAt: Date
  status: $Enums.DealStatus
  tags: { id: string; name: string }[]
  contacts: { id: string; name: string; imageUrl?: string }[]
}

interface DealCardProps {
  deal: deal
}

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const statusProgress: Record<$Enums.DealStatus, number> = {
    // OPEN: 20,
    NEGOTIATION: 60,
    PENDING: 40,
    WON: 100,
    LOST: 0,
    CANCELLED: 0,
  }

  const statusColors: Record<$Enums.DealStatus, string> = {
    // OPEN: 'text-info',
    NEGOTIATION: 'text-warning',
    PENDING: 'text-accent',
    WON: 'text-success',
    LOST: 'text-error',
    CANCELLED: 'text-gray-400',
  }

  const statusIcon: Record<$Enums.DealStatus, React.ReactNode> = {
    // OPEN: <ClockIcon className="w-4 h-4" />,
    NEGOTIATION: <HandRaisedIcon className="w-4 h-4" />,
    PENDING: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
    WON: <CheckBadgeIcon className="w-4 h-4" />,
    LOST: <XCircleIcon className="w-4 h-4" />,
    CANCELLED: <XCircleIcon className="w-4 h-4" />,
  }

  const progress = statusProgress[deal.status]
  const icon = statusIcon[deal.status]
  const color = statusColors[deal.status]

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="block rounded-xl bg-base-100 shadow hover:shadow-md transition-shadow duration-300 p-4"
    >
      <div className="flex justify-between items-start gap-4">
        {/* Deal info */}
        <div className="flex-1">
          <h2 className="text-base font-semibold break-words leading-snug">{deal.title}</h2>
          <p className="text-sm text-accent mt-1">
            ${deal.amount.toFixed(2)} · {deal.updatedAt.toLocaleDateString()}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {deal.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="badge badge-sm badge-outline bg-primary text-primary-content"
              >
                {tag.name}
              </span>
            ))}
            {deal.tags.length > 3 && (
              <span className="badge badge-sm badge-ghost">
                +{deal.tags.length - 3}
              </span>
            )}
          </div>

          {/* Status and contacts */}
          <div className="flex justify-between items-center mt-3">
            <div className={`badge badge-sm flex items-center gap-1 ${color}`}>
              {icon} {deal.status}
            </div>

            <div className="flex -space-x-2">
              {deal.contacts.slice(0, 3).map((c) => (
                <div key={c.id} className="avatar w-6 h-6">
                  {c.imageUrl ? (
                    <Image
                      src={c.imageUrl}
                      alt={c.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="bg-neutral text-neutral-content rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {c.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="tooltip tooltip-left" data-tip={`${progress}% complete`}>
          <div
            className={`radial-progress ${color} animate-spin-slow`}
            style={{ '--value': progress, '--size': '3rem', '--thickness': '4px' } as React.CSSProperties}
            role="progressbar"
          >
            {progress}%
          </div>
        </div>
      </div>
    </Link>
  )
}

export default DealCard
