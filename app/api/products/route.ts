import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

// GET: Fetch all products
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new product
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, unitPrice, sku } = body;

    if (!name || !unitPrice) {
      return NextResponse.json({ error: "Name and Price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        unitPrice: parseFloat(unitPrice),
        sku,
        userId: user.id
      }
    });

    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Remove a product
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = body;

    await prisma.product.delete({
      where: { id, userId: user.id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}