import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest, 
  { params }: { params: { token: string } }
) {
  // Fix: Await params here as well
  const { token } = await params;
  const { signature } = await request.json();


  if (!token || !signature) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    // Verify deal exists first
    const deal = await prisma.deal.findUnique({ where: { shareToken: token } });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    // Update Deal: Signed + Move to 'Negotiation' if it was in 'Proposal'
    let updateData: any = {
      signature,
      signedAt: new Date()
    };

    if (deal.stage === 'Proposal') {
      updateData.stage = 'Negotiation'; // Move forward automatically
    }

    const updated = await prisma.deal.update({
      where: { id: deal.id },
      data: updateData
    });

    return NextResponse.json({ success: true, deal: updated });
  } catch (error) {
    console.error("Signing Error:", error);
    return NextResponse.json({ error: "Failed to sign" }, { status: 500 });
  }
}