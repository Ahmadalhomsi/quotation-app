import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

// GET /api/customers/[id] - Belirli bir müşteriyi getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        quotations: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Son 10 teklif
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Müşteri alınırken hata:', error)
    return NextResponse.json(
      { error: 'Müşteri alınamadı' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Müşteriyi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }

    // If email is being updated, check if it's already taken by another customer
    if (body.email && body.email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: body.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 409 }
        )
      }
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Müşteri güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Müşteri güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Müşteriyi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { quotations: true } }
      }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }

    // Check if customer has quotations
    if (existingCustomer._count.quotations > 0) {
      return NextResponse.json(
        { error: 'Bu müşteriye ait teklifler bulunduğu için silinemez' },
        { status: 409 }
      )
    }

    await prisma.customer.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Müşteri başarıyla silindi' })
  } catch (error) {
    console.error('Müşteri silinirken hata:', error)
    return NextResponse.json(
      { error: 'Müşteri silinemedi' },
      { status: 500 }
    )
  }
}