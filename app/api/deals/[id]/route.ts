import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ✅ Get ID from the URL
  const id = request.nextUrl.pathname.split('/').pop()
  if (!id) {
    return NextResponse.json({ error: 'Missing deal ID' }, { status: 400 })
  }

  const body = await request.json()
  const { title, amount, status, closeDate, contactIds } = body

  try {
    const updatedDeal = await prisma.deal.update({
      where: {
        id,
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
    })

    return NextResponse.json({ success: true, deal: updatedDeal })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Deal not found or update failed' }, { status: 404 })
  }
}
