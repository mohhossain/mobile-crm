import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, description, unitPrice, sku } = body;

    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name,
        description,
        unitPrice: parseFloat(unitPrice),
        sku
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}