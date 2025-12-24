import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  try {
    const deal = await prisma.deal.findUnique({ where: { shareToken: token } });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    // Automation: Move to Negotiation if in early stages
    const earlyStages = ['Lead', 'Meeting', 'Proposal'];
    
    if (earlyStages.includes(deal.stage)) {
        await prisma.deal.update({
            where: { id: deal.id },
            data: { 
                stage: 'Negotiation',
                // FIX: Status must be 'OPEN' (valid enum), not 'NEGOTIATION'
                status: 'OPEN', 
                probability: 80,
                portalViews: { increment: 1 }
            }
        });
        return NextResponse.json({ success: true, movedTo: 'Negotiation' });
    }

    // Just track view
    await prisma.deal.update({
        where: { id: deal.id },
        data: { portalViews: { increment: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View Tracking Error:", error);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}