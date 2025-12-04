import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

// GET: Fetch ALL contacts
export async function GET() { 
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { 
        tags: true,
        company: true // Include the relation
      },
    });

    // Flatten structure for frontend
    const formattedContacts = contacts.map(c => ({
      ...c,
      company: c.company?.name || c.companyName || null,
    }));

    return NextResponse.json(formattedContacts);     
  } 
  catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a NEW contact
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { 
      name, email, phone, tags, imageUrl, 
      jobTitle, company: companyNameInput, location, linkedin 
    } = body;

    // 1. Handle Tags: Connect existing or Create new
    const tagConnect = tags && Array.isArray(tags) ? {
       connectOrCreate: tags.map((t: string) => ({
         where: { name: t },
         create: { name: t }
       }))
    } : undefined;

    // 2. Handle Company: Find existing or Create new
    let companyConnect = undefined;
    if (companyNameInput) {
      const existingCompany = await prisma.company.findFirst({
        where: { 
          name: { equals: companyNameInput, mode: 'insensitive' },
          userId: user.id 
        }
      });

      if (existingCompany) {
        companyConnect = { connect: { id: existingCompany.id } };
      } else {
        companyConnect = { create: { name: companyNameInput, userId: user.id } };
      }
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        jobTitle,
        location,
        linkedin,
        lastContactedAt: new Date(),
        imageUrl,
        user: { connect: { id: user.id } },
        ...(tagConnect ? { tags: tagConnect } : {}),
        ...(companyConnect ? { company: companyConnect } : { companyName: companyNameInput }),
      },
      include: { company: true, tags: true }
    }) as any;

    // Flatten response for frontend
    return NextResponse.json({ 
      contact: {
        ...contact,
        company: contact.company?.name || contact.companyName
      } 
    });

  } catch (err) {
    console.error("Error creating contact:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Mass Delete
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await prisma.contact.deleteMany({
      where: { id: { in: ids }, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting contacts:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}