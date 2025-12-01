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
    const { 
      name, email, phone, tags, imageUrl, 
      jobTitle, company, location, linkedin 
    } = body;

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
        jobTitle,
        company,
        location,
        linkedin,
        lastContactedAt: new Date(),
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

// DELETE: Mass Delete Contacts
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Delete multiple contacts
    await prisma.contact.deleteMany({
      where: {
        id: { in: ids },
        userId: user.id, // Security check: ensure these contacts belong to user
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting contacts:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}