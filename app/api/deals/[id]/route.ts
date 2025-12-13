import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

const toSafeDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
};

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
      expenses: { orderBy: { date: 'desc' } },
      lineItems: true,
      invoices: { orderBy: { createdAt: 'desc' } }
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
  const { title, amount, status, stage, closeDate, contactIds, probability, roadmap } = body

  try {
    const updatedDeal = await prisma.deal.update({
      where: { id, userId: user.id },
      data: {
        ...(title && { title }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(status && { status }),
        ...(stage && { stage }), // NEW: Update Visual Stage independently
        ...(probability !== undefined && { probability }),
        ...(closeDate !== undefined && { closeDate: toSafeDate(closeDate) }),
        ...(roadmap && { roadmap }),
        
        ...(contactIds && {
          contacts: {
            set: [], 
            connect: contactIds.map((cid: string) => ({ id: cid }))
          }
        })
      },
      include: { contacts: true, expenses: true, tasks: true, notes: true, invoices: true }
    })

    return NextResponse.json({ success: true, deal: updatedDeal })
  } catch (err) {
    console.error("Update Deal Error:", err)
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