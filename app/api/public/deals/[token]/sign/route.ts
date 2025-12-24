import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  // Extract signedName from body
  const { signature, signedName } = await request.json();

  if (!token || !signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const deal = await prisma.deal.findUnique({ where: { shareToken: token } });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const updated = await prisma.deal.update({
      where: { id: deal.id },
      data: {
        signature,
        signedName: signedName || "Authorized Client", // Save the printed name
        signedAt: new Date(),
        status: 'WON',        
        stage: 'Won',         
        probability: 100,     
      }
    });

    return NextResponse.json({ success: true, deal: updated });
  } catch (error) {
    console.error("Signing Error:", error);
    return NextResponse.json({ error: "Failed to sign" }, { status: 500 });
  }
}