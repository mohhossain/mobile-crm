// POST /api/tags
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tags, dealId } = body;

  if (!Array.isArray(tags)) {
    return NextResponse.json({ error: "Tags must be an array" }, { status: 400 });
  }

  try {
    // Ensure all tag names are lowercase and trimmed
    const sanitizedTags = tags.map((tag: string) => tag.trim().toLowerCase());

    // 1. Create missing tags
    const existingTags = await prisma.tag.findMany({
      where: { name: { in: sanitizedTags } },
    });

    const existingTagNames = existingTags.map((tag: { name: any; }) => tag.name);
    const newTagNames = sanitizedTags.filter(tag => !existingTagNames.includes(tag));

    if (newTagNames.length > 0) {
      await prisma.tag.createMany({
        data: newTagNames.map(name => ({ name })),
        skipDuplicates: true,
      });
    }

    // 2. Get all final tags (existing + newly created)
    const allTags = await prisma.tag.findMany({
      where: { name: { in: sanitizedTags } },
    });

    // 3. Disconnect all current tags for the deal
    await prisma.deal.update({
      where: { id: dealId },
      data: { tags: { set: [] } }, // disconnect ALL
    });

    // 4. Reconnect only selected tags
    await prisma.deal.update({
      where: { id: dealId },
      data: {
        tags: {
          connect: allTags.map((tag: { id: any; }) => ({ id: tag.id })),
        },
      },
    });

    return NextResponse.json(allTags, { status: 200 });
  } catch (error) {
    console.error("Error updating tags:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
