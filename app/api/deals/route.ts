import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

const toSafeDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
};

// Default Job Sheet Stages
const DEFAULT_ROADMAP = [
  { id: "stage-1", title: "Prep", status: "ACTIVE" },
  { id: "stage-2", title: "The Work", status: "PENDING" },
  { id: "stage-3", title: "Wrap Up", "status": "PENDING" }
];

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const deals = await prisma.deal.findMany({
            where: { userId: user.id },
            include: {
                tags: true,
                contacts: true,
                lineItems: true,
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
  const { title, amount, tags, contactIds, closeDate, notes, expenses, lineItems } = body;

  const safeTags = Array.isArray(tags) ? tags : [];
  const safeContactIds = Array.isArray(contactIds) ? contactIds : [];
  const safeNotes = Array.isArray(notes) ? notes.filter((n: any) => typeof n === "string" && n.trim() !== "") : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeLineItems = Array.isArray(lineItems) ? lineItems : [];
  const parsedAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;

  try {
    const deal = await prisma.deal.create({
      data: {
        title,
        amount: parsedAmount,
        status: "OPEN", // Always start OPEN
        stage: "Lead",  // Always start in Lead column
        probability: 20,
        userId: user.id,
        closeDate: toSafeDate(closeDate),
        roadmap: DEFAULT_ROADMAP,
        
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

        expenses: safeExpenses.length > 0 ? {
          create: safeExpenses.map((exp: any) => ({
            description: exp.description,
            amount: parseFloat(exp.amount),
            category: exp.category || "OTHER",
            date: exp.date ? new Date(exp.date) : new Date(),
            userId: user.id
          }))
        } : undefined,

        lineItems: safeLineItems.length > 0 ? {
          create: safeLineItems.map((item: any) => ({
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
            productId: item.productId || null
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