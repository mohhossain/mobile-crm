import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ownerUsername, name, email, message, serviceId } = body;

    if (!ownerUsername || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Find the Business Owner (User) by username
    const owner = await prisma.user.findUnique({
      where: { username: ownerUsername },
      include: { 
        // Optional: Check if they have a specific stage for "New Leads"
        // For now, we will default to 'OPEN' deal status
      }
    });

    if (!owner) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Find or Create the Contact (Lead)
    // We check if this person already exists in the owner's CRM
    let contact = await prisma.contact.findFirst({
      where: { 
        userId: owner.id,
        email: email
      }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name,
          email,
          userId: owner.id,
          lastContactedAt: new Date(),
          // You could add a tag here like "Inbound Lead"
          tags: {
            connectOrCreate: {
              where: { name: "Website Inquiry" },
              create: { name: "Website Inquiry" }
            }
          }
        }
      });
    }

    // 3. Create the Deal
    // If a service was selected, use its price. Otherwise $0.
    let dealAmount = 0;
    let dealTitle = `${name} - Inquiry`;

    if (serviceId) {
      const service = await prisma.product.findUnique({ where: { id: serviceId } });
      if (service) {
        dealAmount = service.unitPrice;
        dealTitle = `${name} - ${service.name}`;
      }
    }

    const deal = await prisma.deal.create({
      data: {
        title: dealTitle,
        amount: dealAmount,
        status: "PENDING", // Default to first stage
        probability: 20, // Low probability for raw inbound leads
        userId: owner.id,
        contacts: {
          connect: { id: contact.id }
        },
        notes: message ? {
          create: {
            content: `Inquiry Message: "${message}"`,
            userId: owner.id
          }
        } : undefined
      }
    });

    return NextResponse.json({ success: true, dealId: deal.id });

  } catch (error) {
    console.error("Inquiry Error:", error);
    return NextResponse.json({ error: "Failed to process inquiry" }, { status: 500 });
  }
}