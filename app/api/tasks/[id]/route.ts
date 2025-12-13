import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

const toSafeDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
};

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { status, title, description, priority, dueDate, stage } = body

  try {
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = Number(priority);
    if (stage !== undefined) updateData.stage = stage; // Allow moving tasks between stages
    
    if (dueDate !== undefined) {
      updateData.dueDate = toSafeDate(dueDate);
    }

    const updatedTask = await prisma.task.update({
      where: { id, userId: user.id },
      data: updateData
    })
    return NextResponse.json(updatedTask)
  } catch (err) {
    console.error("Task Update Error:", err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    await prisma.task.delete({
      where: { id, userId: user.id }
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Task Delete Error:", err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}