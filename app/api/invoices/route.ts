import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { dealId, number, issueDate, dueDate, items } = body;

    // Calculate total amount from items to ensure backend consistency
    const amount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        dealId,
        number,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        amount,
        status: 'DRAFT',
        items: items // Save the snapshot of line items as JSON
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}