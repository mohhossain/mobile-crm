

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the user exists in your Prisma DB
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Fetch user details from Clerk

      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`  || "Unnamed",
          email: clerkUser.emailAddresses[0]?.emailAddress || "unknown@unknown.com",
        },
      });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Error syncing user:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
