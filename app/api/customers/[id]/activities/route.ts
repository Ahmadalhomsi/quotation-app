import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/customers/[id]/activities - Müşteri aktivitelerini listele
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    const activities = await prisma.customerActivity.findMany({
      where: { customerId: resolvedParams.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Son 50 aktivite
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Müşteri aktiviteleri alınırken hata:', error)
    return NextResponse.json(
      { error: 'Aktiviteler alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/customers/[id]/activities - Yeni aktivite ekle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    // Validation
    if (!body.type) {
      return NextResponse.json(
        { error: 'Aktivite türü gereklidir' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }

    const activity = await prisma.customerActivity.create({
      data: {
        customerId: resolvedParams.id,
        type: body.type,
        description: body.description,
        result: body.result,
        nextAction: body.nextAction,
        createdBy: body.createdBy || 'System'
      }
    })

    // Update customer's last contact date
    await prisma.customer.update({
      where: { id: resolvedParams.id },
      data: { 
        lastContact: new Date(),
        // Update next action date if provided
        ...(body.nextActionDate && { nextContact: new Date(body.nextActionDate) })
      }
    })

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('Aktivite oluşturulurken hata:', error)
    return NextResponse.json(
      { error: 'Aktivite oluşturulamadı' },
      { status: 500 }
    )
  }
}