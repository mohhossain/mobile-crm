import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

// Helper to prevent Invalid Date crashes
const toSafeDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
};

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const deals = await prisma.deal.findMany({
            where: { userId: user.id },
            include: {
                tags: true,
                contacts: true,
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

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, amount, tags, status, contactIds, closeDate, notes, expenses } = body;

  const safeTags = Array.isArray(tags) ? tags : [];
  const safeContactIds = Array.isArray(contactIds) ? contactIds : [];
  const safeNotes = Array.isArray(notes) ? notes.filter((n: any) => typeof n === "string" && n.trim() !== "") : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const parsedAmount = typeof amount === "number" && !isNaN(amount) ? amount : null;

  try {
    const deal = await prisma.deal.create({
      data: {
        title,
        amount: parsedAmount ?? 0,
        status: status || "PENDING",
        userId: user.id,
        // FIX: Properly parse the date
        closeDate: toSafeDate(closeDate), 
        
        tags: safeTags.length > 0 ? {
          connectOrCreate: safeTags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        } : undefined,
        
        contacts: safeContactIds.length > 0 ? {
          connect: safeContactIds.map((id: string) => ({ id })),
        } : undefined,
        
        notes: safeNotes.length > 0 ? {
          create: safeNotes.map((note: string) => ({
            content: note,
            userId: user.id,
          })),
        } : undefined,

        // FIX: Do NOT pass dealId here. Prisma automatically links nested creates.
        expenses: safeExpenses.length > 0 ? {
          create: safeExpenses.map((exp: any) => ({
            description: exp.description,
            amount: parseFloat(exp.amount),
            category: exp.category || "OTHER",
            date: exp.date ? new Date(exp.date) : new Date(),
            userId: user.id
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