import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  
  const deal = await prisma.deal.findUnique({
    where: { id, userId: user.id },
    include: { 
      tags: true,
      contacts: true,
      tasks: { orderBy: { dueDate: 'asc' }, include: { deal: true } },
      notes: { orderBy: { createdAt: 'desc' } },
      expenses: { orderBy: { date: 'desc' } }
    }
  })
  
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(deal)
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { title, amount, status, closeDate, contactIds, probability } = body

  try {
    const updatedDeal = await prisma.deal.update({
      where: { id, userId: user.id },
      data: {
        title,
        amount,
        status,
        probability, // NEW field
        closeDate: closeDate ? new Date(closeDate) : null,
        ...(contactIds && {
          contacts: {
            set: [], // Reset and re-link
            connect: contactIds.map((cid: string) => ({ id: cid }))
          }
        })
      },
      include: { contacts: true }
    })

    return NextResponse.json({ success: true, deal: updatedDeal })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    await prisma.deal.delete({ where: { id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}