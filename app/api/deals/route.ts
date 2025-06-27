import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";


// make a get/post/delete request to the deals route 

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch deals for the user
        const deals = await prisma.deal.findMany({
            where: { userId: user.id }, // Use the user's ID from the database
            include: {
                tags: true, // Include tags related to the deal
                contacts: true, // Include contacts related to the deal
                notes: {
                    include: {
                        user: true, // Include user who created the note
                    },
                },
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

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, amount, tags, status, contactIds, closeDate, notes } = body;

  // Defensive defaults
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeContactIds = Array.isArray(contactIds) ? contactIds : [];
  const safeNotes = Array.isArray(notes) ? notes.filter(n => typeof n === "string" && n.trim() !== "") : [];

  // Validate amount - convert to number or null
  const parsedAmount = typeof amount === "number" && !isNaN(amount) ? amount : null;

  try {
    const deal = await prisma.deal.create({
      data: {
        title,
        amount: parsedAmount ?? 0,
        status: status || "PENDING",
        userId: user.id,
        closeDate: closeDate ? new Date(closeDate) : null,
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

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
        return NextResponse.json({ error: "Missing deal id" }, { status: 400 });
    }

    try {
        // Delete the deal by ID from params check if the deal belongs to the user

        const deletedDeal = await prisma.deal.delete({
            where: {
                id,
                userId: user.id, // Ensure the deal belongs to the user
            },
        });

        return NextResponse.json(deletedDeal);
    } catch (err) {
        console.error("Error deleting deal:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

