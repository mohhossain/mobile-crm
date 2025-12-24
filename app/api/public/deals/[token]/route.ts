import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  try {
    const deal = await prisma.deal.findUnique({
      where: { shareToken: token },
      include: {
        lineItems: true,
        company: true,
        // FIX: This was missing! We must fetch contacts to display "Emily Chen"
        contacts: true, 
        user: {
          select: {
            name: true,
            email: true,
            defaultPaymentLink: true,
            paymentInstructions: true,
            paymentMethods: true,
            terms: true, 
            avatar: true,
            username: true,
          }
        },
        invoices: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error("[Portal API] Database Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}