import { NextRequest, NextResponse } from 'next/server'
import { CreateCustomerData } from '@/lib/types'
import prisma from '@/lib/prisma'

// GET /api/customers - Tüm müşterileri listele
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customerTypes: {
          include: {
            type: true
          }
        },
        _count: {
          select: { quotations: true }
        }
      }
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Müşteriler alınırken hata:', error)
    return NextResponse.json(
      { error: 'Müşteriler alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Yeni müşteri oluştur
export async function POST(request: NextRequest) {
  try {
    const body: CreateCustomerData = await request.json()
    
    // Validation
    if (!body.companyName || !body.contactName) {
      return NextResponse.json(
        { error: 'Şirket adı ve iletişim kişisi gereklidir' },
        { status: 400 }
      )
    }

    // Set default values for new fields if not provided
    const customerData = {
      ...body,
      priority: body.priority || 1,
      lastContact: new Date() // Set current time as first contact
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

      // Check if email already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: body.email }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 409 }
        )
      }
    }

    // Separate typeIds from customer data
    const { typeIds = [], ...customerCreateData } = customerData

    // Clean up empty strings for nullable fields
    if (customerCreateData.email === '') {
      customerCreateData.email = undefined
    }
    if (customerCreateData.phone === '') {
      customerCreateData.phone = undefined
    }

    const customer = await prisma.customer.create({
      data: customerCreateData
    })

    // Create customer type assignments if any are provided
    if (typeIds.length > 0) {
      await prisma.customerCustomerType.createMany({
        data: typeIds.map((typeId: string) => ({
          customerId: customer.id,
          typeId: typeId
        }))
      })
    }

    // Fetch the created customer with its types
    const customerWithTypes = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: {
        customerTypes: {
          include: {
            type: true
          }
        }
      }
    })

    return NextResponse.json({ customer: customerWithTypes }, { status: 201 })
  } catch (error) {
    console.error('Müşteri oluşturulurken hata:', error)
    return NextResponse.json(
      { error: 'Müşteri oluşturulamadı' },
      { status: 500 }
    )
  }
}