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
  const { name, description, unitPrice, sku, isPublic } = body

  try {
    const updatedProduct = await prisma.product.update({
      where: { id, userId: user.id },
      data: {
        // Update fields if they are provided in the body
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(unitPrice !== undefined && { unitPrice: parseFloat(unitPrice) }),
        ...(sku !== undefined && { sku }),
        ...(isPublic !== undefined && { isPublic }),
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (err) {
    console.error("Product Update Error:", err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
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
    await prisma.product.delete({ where: { id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}