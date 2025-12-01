import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/currentUser'

// GET: Fetch Single Contact
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  
  const contact = await prisma.contact.findUnique({
    where: { id, userId: user.id },
    include: { tags: true }
  })
  
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contact)
}

// PUT: Update Contact
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  
  // 1. Destructure new fields to allow updates
  const { 
    name, email, phone, tags, imageUrl, 
    jobTitle, company, location, linkedin 
  } = body

  try {
    const updateData: any = {
      name,
      email,
      phone,
      // 2. Include new fields in update object
      jobTitle,
      company,
      location,
      linkedin,
      imageUrl,
    }

    if (tags && Array.isArray(tags)) {
      updateData.tags = {
        set: [],
        connectOrCreate: tags.map((t: string) => ({
          where: { name: t },
          create: { name: t }
        }))
      }
    }

    const updatedContact = await prisma.contact.update({
      where: { id, userId: user.id },
      data: updateData,
      include: { tags: true }
    })

    return NextResponse.json({ success: true, contact: updatedContact })
  } catch (err) {
    console.error("Update Contact Error:", err)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

// DELETE: Remove Contact
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    await prisma.contact.delete({ where: { id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}