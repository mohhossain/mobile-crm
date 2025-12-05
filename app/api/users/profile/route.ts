import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { username, bio, website, isProfileLive, avatar } = body;

    // 1. Check username uniqueness if it's being changed
    if (username) {
      const existing = await prisma.user.findUnique({
        where: { username },
      });
      // If username exists and belongs to someone else, throw error
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "Username taken" }, { status: 409 });
      }
    }

    // 2. Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        bio,
        website,
        avatar,
        isProfileLive
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}