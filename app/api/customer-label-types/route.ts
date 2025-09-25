import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/customer-label-types - List all customer label types
export async function GET() {
  try {
    const labelTypes = await prisma.customerType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ labelTypes })
  } catch (error) {
    console.error('Label types fetch error:', error)
    return NextResponse.json(
      { error: 'Etiket tipleri alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/customer-label-types - Create new label type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Etiket adı gereklidir' },
        { status: 400 }
      )
    }

    // Check if name already exists
    const existingLabel = await prisma.customerType.findUnique({
      where: { name: body.name }
    })

    if (existingLabel) {
      return NextResponse.json(
        { error: 'Bu etiket adı zaten kullanılıyor' },
        { status: 409 }
      )
    }

    const labelType = await prisma.customerType.create({
      data: {
        name: body.name,
        color: body.color || '#3B82F6',
        description: body.description
      }
    })

    return NextResponse.json({ labelType }, { status: 201 })
  } catch (error) {
    console.error('Label type creation error:', error)
    return NextResponse.json(
      { error: 'Etiket tipi oluşturulamadı' },
      { status: 500 }
    )
  }
}