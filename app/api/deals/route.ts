import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

const toSafeDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
};

// GET Method (Existing code...)
export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const deals = await prisma.deal.findMany({
            where: { userId: user.id },
            include: {
                tags: true,
                contacts: true,
                lineItems: true, // Ensure we fetch items
                notes: { include: { user: true } },
                expenses: true,
            },
        });
        return NextResponse.json(deals);
    } catch (err) {
        console.error("Error fetching deals:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST Method (THE FIX)

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, amount, tags, contactIds, closeDate, notes, expenses, lineItems } = body;

  const safeTags = Array.isArray(tags) ? tags : [];
  const safeContactIds = Array.isArray(contactIds) ? contactIds : [];
  const safeNotes = Array.isArray(notes) ? notes.filter((n: any) => typeof n === "string" && n.trim() !== "") : [];
  
  // FIX: Filter out empty items
  const safeLineItems = Array.isArray(lineItems) 
    ? lineItems.filter((i: any) => i.name && i.name.trim() !== "") 
    : [];

  const parsedAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;

  try {
    const deal = await prisma.deal.create({
      data: {
        title,
        amount: parsedAmount,
        status: "OPEN",
        stage: "Lead",
        probability: 20,
        userId: user.id,
        closeDate: toSafeDate(closeDate),
        
        // Tags
        tags: safeTags.length > 0 ? {
          connectOrCreate: safeTags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        } : undefined,
        
        // Contacts
        contacts: safeContactIds.length > 0 ? {
          connect: safeContactIds.map((id: string) => ({ id })),
        } : undefined,
        
        // Notes
        notes: safeNotes.length > 0 ? {
          create: safeNotes.map((note: string) => ({
            content: note,
            userId: user.id,
          })),
        } : undefined,

        // Expenses
        expenses: Array.isArray(expenses) && expenses.length > 0 ? {
          create: expenses.map((exp: any) => ({
            description: exp.description,
            amount: parseFloat(exp.amount),
            category: exp.category || "OTHER",
            date: exp.date ? new Date(exp.date) : new Date(),
            userId: user.id
          }))
        } : undefined,

        // FIX: Explicitly map line items. 
        // If productId exists, we simply set the scalar field `productId` (which is cleaner than using connect)
        lineItems: safeLineItems.length > 0 ? {
          create: safeLineItems.map((item: any) => ({
            name: item.name,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            description: item.description || "",
            // This is the critical fix for linking:
            productId: (item.productId && typeof item.productId === 'string') ? item.productId : null
          }))
        } : undefined
      },
    });
    return NextResponse.json(deal);
  } catch (err) {
    console.error("Error creating deal:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Missing deal id" }, { status: 400 });

    try {
        const deletedDeal = await prisma.deal.delete({
            where: { id, userId: user.id },
        });
        return NextResponse.json(deletedDeal);
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}