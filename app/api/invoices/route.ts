import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { dealId, issueDate, dueDate, items, status } = body;

    const amount = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.price)), 0);

    // FIX: Generate a unique invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        dealId,
        // FIX: Add the required number field
        number: invoiceNumber, 
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        amount,
        status: status || "DRAFT",
        items: items // Assuming items is a JSON field
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[INVOICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId");

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        ...(dealId ? { dealId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[INVOICES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}