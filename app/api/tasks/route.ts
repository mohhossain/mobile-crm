import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { dueDate: 'asc' },
      include: {
        deal: true,
        contacts: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Helper to safely parse dates
const toSafeDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  // Check if date is valid
  if (isNaN(date.getTime())) return null;
  return date;
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, priority, startDate, dueDate, dealId, contactIds } = body;

    const validContactIds = Array.isArray(contactIds) 
      ? contactIds.filter((id: any) => typeof id === 'string') 
      : [];

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        priority: priority ? parseInt(priority, 10) : 1,
        // Fix: Use toSafeDate helper
        startDate: toSafeDate(startDate),
        dueDate: toSafeDate(dueDate),
        userId: user.id,
        dealId: (typeof dealId === 'string' && dealId.length > 0) ? dealId : null,
        contacts: {
          connect: validContactIds.map((id: string) => ({ id })),
        },
      },
      include: {
        deal: true,
        contacts: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}