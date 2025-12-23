import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    // Destructure all possible settings fields
    const { 
        defaultPaymentLink, 
        paymentInstructions, 
        paymentMethods,
        terms // NEW
    } = body;

    const updateData: any = {};
    if (defaultPaymentLink !== undefined) updateData.defaultPaymentLink = defaultPaymentLink;
    if (paymentInstructions !== undefined) updateData.paymentInstructions = paymentInstructions;
    if (paymentMethods !== undefined) updateData.paymentMethods = paymentMethods;
    if (terms !== undefined) updateData.terms = terms;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}