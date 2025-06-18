import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch notes for the user
        const notes = await prisma.note.findMany({
            where: { userId: user.id }, // Use the user's ID from the database
            
        });

        return NextResponse.json(notes);
    } catch (err) {
        console.error("Error fetching notes:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    try {
        // Create a new note for the user
        const note = await prisma.note.create({
            data: {
                content,
                userId: user.id, // Use the user's ID from the database
            },
        });

        return NextResponse.json(note);
    } catch (err) {
        console.error("Error creating note:", err);
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

    try {
        // Delete the note for the user
        const note = await prisma.note.delete({
            where: {
                id,
                userId: user.id, // Ensure the note belongs to the user
            },
        });

        return NextResponse.json(note);
    } catch (err) {
        console.error("Error deleting note:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}   