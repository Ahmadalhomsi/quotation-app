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
    if (!body.companyName || !body.contactName || !body.email) {
      return NextResponse.json(
        { error: 'Şirket adı, iletişim kişisi ve e-posta gereklidir' },
        { status: 400 }
      )
    }

    // Email validation
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

    const customer = await prisma.customer.create({
      data: body
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error('Müşteri oluşturulurken hata:', error)
    return NextResponse.json(
      { error: 'Müşteri oluşturulamadı' },
      { status: 500 }
    )
  }
}