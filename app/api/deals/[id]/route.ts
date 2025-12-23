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
  
  const { 
    title, 
    amount, 
    status, 
    stage, 
    closeDate, 
    contactIds, 
    probability, 
    roadmap,
    depositAmount,       
    paymentLink,         
    paymentInstructions, 
    paymentMethods,      
    shareToken           
  } = body

  try {
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (status !== undefined) updateData.status = status;
    if (stage !== undefined) updateData.stage = stage;
    if (probability !== undefined) updateData.probability = probability;
    if (closeDate !== undefined) updateData.closeDate = toSafeDate(closeDate);
    if (roadmap !== undefined) updateData.roadmap = roadmap;
    
    if (depositAmount !== undefined) updateData.depositAmount = parseFloat(depositAmount);
    if (paymentLink !== undefined) updateData.paymentLink = paymentLink;
    if (paymentInstructions !== undefined) updateData.paymentInstructions = paymentInstructions;
    if (paymentMethods !== undefined) updateData.paymentMethods = paymentMethods;
    if (shareToken !== undefined) updateData.shareToken = shareToken;

    if (contactIds !== undefined) {
      updateData.contacts = {
        set: [], 
        connect: contactIds.map((cid: string) => ({ id: cid }))
      };
    }

    const updatedDeal = await prisma.deal.update({
      where: { id, userId: user.id },
      data: updateData,
      include: { contacts: true, expenses: true, tasks: true, notes: true, invoices: true, lineItems: true }
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