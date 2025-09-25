import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/customer-status-types - List all customer status types
export async function GET() {
  try {
    const statusTypes = await prisma.customerType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ statusTypes })
  } catch (error) {
    console.error('Status types fetch error:', error)
    return NextResponse.json(
      { error: 'Durum tipleri alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/customer-status-types - Create new status type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Durum adı gereklidir' },
        { status: 400 }
      )
    }

    // Check if name already exists
    const existingStatus = await prisma.customerType.findUnique({
      where: { name: body.name }
    })

    if (existingStatus) {
      return NextResponse.json(
        { error: 'Bu durum adı zaten kullanılıyor' },
        { status: 409 }
      )
    }

    const statusType = await prisma.customerType.create({
      data: {
        name: body.name,
        color: body.color || '#6B7280',
        description: body.description,
        sortOrder: body.sortOrder || 0
      }
    })

    return NextResponse.json({ statusType }, { status: 201 })
  } catch (error) {
    console.error('Status type creation error:', error)
    return NextResponse.json(
      { error: 'Durum tipi oluşturulamadı' },
      { status: 500 }
    )
  }
}