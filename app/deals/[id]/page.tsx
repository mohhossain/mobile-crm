import React from 'react'
import { getCurrentUser } from '@/lib/currentUser'
import { prisma } from '@/lib/prisma'
import DealTabs from '@/app/components/DealTabs'
import BackButton from '@/app/components/BackButton'
import DeleteDealButton from '@/app/components/DeleteDealButton'
import Link from 'next/link'

interface DealPageProps {
  params: {
    id: string
  }
}

const Page = async ({ params }: DealPageProps) => {
  const user = await getCurrentUser()

  const {id} = await params;

  if (!user) {
    return <div className="p-4 text-center text-gray-500">Unauthorized.</div>
  }

  const deal = await prisma.deal.findUnique({
    where: {
      id,
      userId: user.id,
    },
    include: {
      tags: true,
      tasks: true,
      notes: true,
      contacts: true
    },
  })

  if (!deal) {
    return <div className="text-center text-gray-500">Deal not found.</div>
  }

  return (
    <div className="p-4 space-y-4 mx-auto max-w-md">
      <BackButton />

      <div className="flex justify-between items-start">
        <h1 className="text-xl font-bold text-wrap break-words break-all">{deal.title}</h1>

        <div className="flex items-center space-x-2 ml-4 mr-2">
        <DeleteDealButton dealId={deal.id} />
        <Link href={`/deals/${deal.id}/edit`} className="btn btn-sm btn-outline">
            Edit Deal
        </Link>
        </div>
        
      </div>

      <h3>
        Amount:
        <span className="text-success text-lg ml-1">${deal.amount}</span>
      </h3>

      <h3>
        Close Date:
        <span className="text-warning ml-1">
          {deal.closeDate
            ? new Date(deal.closeDate).toLocaleDateString()
            : 'N/A'}
        </span>
      </h3>

      <h3>
        Status:
        <span
          className={`badge ml-1 ${
            deal.status === 'WON'
              ? 'badge-success'
              : deal.status === 'LOST'
              ? 'badge-error'
              : deal.status === 'PENDING'
              ? 'badge-warning'
              : 'badge-info'
          }`}
        >
          {deal.status}
        </span>
      </h3>

      <DealTabs deal={deal} />
    </div>
  )
}

export default Page
