import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')?.trim()

  if (!query) {
    return NextResponse.json([], { status: 200 })
  }

  const deals = await prisma.deal.findMany({
    where: {
      userId: user.id,
      title: {
        contains: query,
        mode: 'insensitive',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      contacts: true,
    },
  })

  return NextResponse.json(deals)
}
