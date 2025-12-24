import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { Prisma } from '@prisma/client';

interface LineItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  productId?: string | null;
}

interface RequestBody {
  items: LineItem[];
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing Deal ID" }, { status: 400 });

  const body: RequestBody = await request.json();
  const { items } = body;

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid items format" }, { status: 400 });
  }

  try {
    const newTotal: number = items.reduce((sum: number, item: LineItem) => {
        return sum + (Number(item.price) * Number(item.quantity));
    }, 0);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Wipe existing items (Simple replacement strategy)
        await tx.dealLineItem.deleteMany({
            where: { dealId: id }
        });

        // 2. Re-create items with product links
        if (items.length > 0) {
            await tx.dealLineItem.createMany({
                data: items.map((item: LineItem) => ({
                    dealId: id,
                    name: item.name,
                    description: item.description || "",
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                    // Ensure product link is preserved
                    productId: item.productId || null 
                }))
            });
        }

        // 3. Update Deal Total
        await tx.deal.update({
            where: { id },
            data: { amount: newTotal }
        });
    });

    return NextResponse.json({ success: true, newTotal });
  } catch (error) {
    console.error("Line Items Update Error:", error);
    return NextResponse.json({ error: "Failed to update items" }, { status: 500 });
  }
}