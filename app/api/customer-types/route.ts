import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch all customer types
export async function GET() {
  try {
    const customerTypes = await prisma.customerType.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      customerTypes
    })
  } catch (error) {
    console.error('Error fetching customer types:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer types' },
      { status: 500 }
    )
  }
}

// POST - Create new customer type
export async function POST(request: NextRequest) {
  try {
    const { name, color, description, category } = await request.json()

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if name already exists
    const existingType = await prisma.customerType.findUnique({
      where: { name }
    })

    if (existingType) {
      return NextResponse.json(
        { success: false, error: 'A customer type with this name already exists' },
        { status: 400 }
      )
    }

    const customerType = await prisma.customerType.create({
      data: {
        name,
        color: color || '#6B7280',
        description,
        category: category || 'custom',
        isActive: true,
        sortOrder: 999 // New types go to the end
      }
    })

    return NextResponse.json({
      success: true,
      customerType
    })
  } catch (error) {
    console.error('Error creating customer type:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer type' },
      { status: 500 }
    )
  }
}