import { NextRequest, NextResponse } from 'next/server'
import { QuotationStatus } from '../../generated/prisma'

import prisma from '@/lib/prisma'

// GET /api/quotations - Tüm teklifleri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    
    const where: { status?: QuotationStatus; customerId?: string } = {}
    
    if (status && Object.values(QuotationStatus).includes(status as QuotationStatus)) {
      where.status = status as QuotationStatus
    }
    
    if (customerId) {
      where.customerId = customerId
    }

    const quotations = await prisma.quotation.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        _count: {
          select: { items: true }
        }
      }
    })

    return NextResponse.json({ quotations })
  } catch (error) {
    console.error('Teklifler alınırken hata:', error)
    return NextResponse.json(
      { error: 'Teklifler alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/quotations - Yeni teklif oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.title || !body.customerId || !body.validUntil) {
      return NextResponse.json(
        { error: 'Başlık, müşteri ve geçerlilik tarihi gereklidir' },
        { status: 400 }
      )
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'En az bir ürün eklenmeli' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }

    // Generate quotation number
    const lastQuotation = await prisma.quotation.findFirst({
      orderBy: { quotationNumber: 'desc' }
    })

    let nextNumber = 1
    if (lastQuotation?.quotationNumber) {
      const match = lastQuotation.quotationNumber.match(/TKL-(\d{4})-(\d{3})/)
      if (match) {
        nextNumber = parseInt(match[2]) + 1
      }
    }

    const currentYear = new Date().getFullYear()
    const quotationNumber = `TKL-${currentYear}-${nextNumber.toString().padStart(3, '0')}`

    // Calculate totals - separate TL and USD totals
    let totalTL = 0
    let totalUSD = 0
    const exchangeRate = body.exchangeRate || 40.0
    const kdvEnabled = body.kdvEnabled !== undefined ? body.kdvEnabled : true
    const kdvRate = body.kdvRate || 20

    for (const item of body.items) {
      if (item.currency === 'TL') {
        totalTL += item.totalPrice
      } else {
        totalUSD += item.totalPrice
      }
    }

    // Apply KDV if enabled
    if (kdvEnabled) {
      totalTL = totalTL * (1 + kdvRate / 100)
      totalUSD = totalUSD * (1 + kdvRate / 100)
    }

    // Create quotation with items
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        title: body.title,
        description: body.description,
        customerId: body.customerId,
        validUntil: new Date(body.validUntil),
        status: body.status || 'DRAFT',
        totalTL,
        totalUSD,
        exchangeRate,
        kdvEnabled,
        kdvRate,
        terms: body.terms,
        notes: body.notes,
        items: {
          create: body.items.map((item: {
            productId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            currency: string;
            discount?: number;
            productName: string;
            productType: string;
          }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            currency: item.currency,
            discount: item.discount || 0,
            productName: item.productName,
            productType: item.productType
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({ quotation }, { status: 201 })
  } catch (error) {
    console.error('Teklif oluşturulurken hata:', error)
    return NextResponse.json(
      { error: 'Teklif oluşturulamadı' },
      { status: 500 }
    )
  }
}