import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/customers/[id] - Belirli bir müşteriyi getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    const customer = await prisma.customer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        customerTypes: {
          include: {
            type: true
          }
        },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    // Validation
    if (!body.companyName || !body.contactName) {
      return NextResponse.json(
        { error: 'Şirket adı ve iletişim kişisi gereklidir' },
        { status: 400 }
      )
    }

    // Email validation (only if provided and not empty)
    if (body.email && body.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Geçerli bir e-posta adresi giriniz' },
          { status: 400 }
        )
      }

      // Check if email already exists (excluding current customer)
      const existingCustomer = await prisma.customer.findFirst({
        where: { 
          email: body.email,
          id: { not: resolvedParams.id }
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 409 }
        )
      }
    }

    // Separate typeIds from customer data
    const { typeIds = [], ...customerUpdateData } = body

    // Clean up empty strings for nullable fields
    if (customerUpdateData.email === '') {
      customerUpdateData.email = undefined
    }
    if (customerUpdateData.phone === '') {
      customerUpdateData.phone = undefined
    }

    // Update customer basic information
    await prisma.customer.update({
      where: { id: resolvedParams.id },
      data: customerUpdateData
    })

    // Update customer type assignments
    // First, delete existing type assignments
    await prisma.customerCustomerType.deleteMany({
      where: { customerId: resolvedParams.id }
    })

    // Then create new type assignments
    if (typeIds.length > 0) {
      await prisma.customerCustomerType.createMany({
        data: typeIds.map((typeId: string) => ({
          customerId: resolvedParams.id,
          typeId: typeId
        }))
      })
    }

    // Fetch updated customer with types
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        customerTypes: {
          include: {
            type: true
          }
        }
      }
    })

    return NextResponse.json({ customer: updatedCustomer })
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    // Check if customer has quotations
    const quotationCount = await prisma.quotation.count({
      where: { customerId: resolvedParams.id }
    })

    if (quotationCount > 0) {
      return NextResponse.json(
        { error: `Bu müşteri silinemez. ${quotationCount} adet teklif bulunmaktadır.` },
        { status: 400 }
      )
    }

    // Delete customer (this will cascade delete customer type assignments)
    await prisma.customer.delete({
      where: { id: resolvedParams.id }
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