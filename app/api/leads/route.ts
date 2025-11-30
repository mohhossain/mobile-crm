import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

// GET: Fetch ALL contacts (Used for Search & Lists)
export async function GET() { 
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } 

  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }, // Newest first
      include: {
        tags: true, 
      },
    });

    // Return a direct array for easier frontend handling
    return NextResponse.json(contacts);     
  } 
  catch (err) {
    console.error("Error fetching contacts:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a NEW contact
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, tags, imageUrl, status = "NEW" } = body;

    // Handle Tags: Connect existing or Create new
    const tagConnect = tags && Array.isArray(tags) ? {
       connectOrCreate: tags.map((t: string) => ({
         where: { name: t },
         create: { name: t }
       }))
    } : undefined;

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        status,
        imageUrl,
        userId: user.id,
        ...(tagConnect ? { tags: tagConnect } : {}),
      },
    });

    return NextResponse.json({ contact });

  } catch (err) {
    console.error("Error creating contact:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}