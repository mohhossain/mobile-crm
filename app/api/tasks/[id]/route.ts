import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { status, title, description, priority, dueDate } = body // Added dueDate

  try {
    const updatedTask = await prisma.task.update({
      where: { id, userId: user.id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description && { description }),
        ...(priority && { priority: Number(priority) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }) // Handle Date update
      }
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