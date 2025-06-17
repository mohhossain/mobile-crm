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
    const { title, amount, tags, status, contactIds } = body;

    try {
        // Create a new deal for the user
        const deal = await prisma.deal.create({
            data: {
                title,
                amount,
                status: status || "PENDING", // Default status is NEW if not provided
                userId: user.id, // Use the user's ID from the database
                tags: {
                    connectOrCreate: tags.map((tag: string) => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                },
                contacts: {
                    connect: contactIds.map((id: string) => ({ id })),
                },
            
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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

