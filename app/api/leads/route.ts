import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  
  const contact = await prisma.contact.findUnique({
    where: { id, userId: user.id },
    include: { tags: true, deals: true, tasks: true }
  })

  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

  return NextResponse.json(contact)
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { name, email, phone, status, tags, imageUrl } = body

  try {
    // Handle Tags: disconnect all and reconnect/create new ones
    // This is a simple strategy; for optimization, you could diff them.
    const tagConnect = tags && Array.isArray(tags) ? {
       connectOrCreate: tags.map((t: string) => ({
         where: { name: t },
         create: { name: t }
       }))
    } : undefined

    // First disconnect existing tags if we are updating tags
    if (tags) {
       await prisma.contact.update({
         where: { id, userId: user.id },
         data: { tags: { set: [] } }
       })
    }

    const updatedContact = await prisma.contact.update({
      where: { id, userId: user.id },
      data: {
        name,
        email,
        phone,
        status,
        imageUrl,
        ...(tags ? { tags: tagConnect } : {})
      },
      include: { tags: true }
    })

    return NextResponse.json({ success: true, contact: updatedContact })
  } catch (err) {
    console.error("Update Contact Error:", err)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
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
    await prisma.contact.delete({
      where: { id, userId: user.id }
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}