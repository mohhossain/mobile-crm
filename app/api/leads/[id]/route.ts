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
    include: { tags: true, company: true }
  })
  
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Flatten for frontend
  const flattened = {
    ...contact,
    company: contact.company?.name || contact.companyName
  }

  return NextResponse.json(flattened)
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
  
  const { 
    name, email, phone, tags, imageUrl, 
    jobTitle, company: companyNameInput, location, linkedin 
  } = body

  try {
    // 1. Handle Company Logic
    let companyUpdate = undefined;
    if (companyNameInput) {
      const existingCompany = await prisma.company.findFirst({
        where: { 
          name: { equals: companyNameInput, mode: 'insensitive' },
          userId: user.id 
        }
      });

      if (existingCompany) {
        companyUpdate = { connect: { id: existingCompany.id } };
      } else {
        companyUpdate = { create: { name: companyNameInput, userId: user.id } };
      }
    } else if (companyNameInput === "") {
      // If explicit empty string, disconnect company
      companyUpdate = { disconnect: true };
    }

    // 2. Prepare Update Data
    const updateData: any = {
      name,
      email,
      phone,
      jobTitle,
      companyName: companyNameInput, // Keep legacy in sync
      company: companyUpdate, // Update relation
      location,
      linkedin,
      imageUrl,
    }

    // 3. Handle Tags
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
      include: { tags: true, company: true }
    })

    // Flatten response
    return NextResponse.json({ 
      success: true, 
      contact: {
        ...updatedContact,
        company: updatedContact.company?.name || updatedContact.companyName
      } 
    })
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