import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: 'asc' },
    include: { deal: true, contacts: true },
  });
  return NextResponse.json(tasks);
}

const toSafeISO = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T12:00:00.000Z`);
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, priority, startDate, dueDate, dealId, contactIds, stage } = body;

    const validContactIds = Array.isArray(contactIds) 
      ? contactIds.filter((id: any) => typeof id === 'string') 
      : [];

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        priority: priority ? parseInt(priority, 10) : 1,
        startDate: toSafeISO(startDate),
        dueDate: toSafeISO(dueDate),
        userId: user.id,
        dealId: (typeof dealId === 'string' && dealId.length > 0) ? dealId : null,
        
        // NEW: Assign to Stage
        stage: stage || null,

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