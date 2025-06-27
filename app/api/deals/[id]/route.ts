import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!params.id) {
        return NextResponse.json({ error: 'Missing deal id' }, { status: 400 })
    }

  const body = await request.json()
  const { title, amount, status, closeDate, contactIds } = body

  // First, update the deal fields (excluding contacts)
  const updatedDeal = await prisma.deal.update({
    where: {
      id: params.id,
      userId: user.id,
    },
    data: {
      title,
      amount,
      status,
      closeDate: closeDate ? new Date(closeDate) : null, 
      ...(contactIds && contactIds.length > 0
        ? {
            contacts: {
              set: contactIds.map((id: string) => ({ id })),
            },
          }
        : {}),
    },
  }).catch(() => null);

  if (!updatedDeal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
