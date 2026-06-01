import { NextRequest, NextResponse } from 'next/server'
import { Prisma, QuotationStatus } from '../../generated/prisma'

import prisma from '@/lib/prisma'

// GET /api/quotations - Tüm teklifleri listele (sayfalama + sunucu taraflı arama)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const search = (searchParams.get('search') || '').trim()

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const pageSizeRaw = parseInt(searchParams.get('pageSize') || '20', 10) || 20
    const pageSize = Math.min(100, Math.max(1, pageSizeRaw))

    const where: Prisma.QuotationWhereInput = {}

    if (status && Object.values(QuotationStatus).includes(status as QuotationStatus)) {
      where.status = status as QuotationStatus
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (search) {
      // Case-insensitive partial match across quotation number, title and
      // the customer's company / contact / phone / email.
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { customer: { is: { companyName: { contains: search, mode: 'insensitive' } } } },
        { customer: { is: { contactName: { contains: search, mode: 'insensitive' } } } },
        { customer: { is: { phone: { contains: search, mode: 'insensitive' } } } },
        { customer: { is: { email: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    const [total, quotations, aggregates] = await Promise.all([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.quotation.aggregate({
        where,
        _count: { _all: true },
        _sum: { totalTL: true, totalUSD: true }
      })
    ])

    const sentCount = await prisma.quotation.count({
      where: { ...where, status: QuotationStatus.SENT }
    })

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return NextResponse.json({
      quotations,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      },
      stats: {
        total,
        sentCount,
        totalTL: aggregates._sum.totalTL ? Number(aggregates._sum.totalTL) : 0,
        totalUSD: aggregates._sum.totalUSD ? Number(aggregates._sum.totalUSD) : 0
      }
    })
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
    const totalDiscount = body.totalDiscount || 0
    const showProductKdv = body.showProductKdv !== undefined ? body.showProductKdv : true

    for (const item of body.items) {
      // Each item now has its own KDV rate
      const itemKdvRate = item.kdvRate || 20
      const itemTotal = item.totalPrice
      const itemWithKdv = kdvEnabled ? itemTotal * (1 + itemKdvRate / 100) : itemTotal
      
      if (item.currency === 'TL') {
        totalTL += itemWithKdv
      } else {
        totalUSD += itemWithKdv
      }
    }

    // Apply total discount if specified
    if (totalDiscount > 0) {
      const discountMultiplier = 1 - (totalDiscount / 100)
      totalTL = totalTL * discountMultiplier
      totalUSD = totalUSD * discountMultiplier
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
        totalDiscount,
        showProductKdv,
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
            kdvRate?: number;
            productName: string;
          }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            currency: item.currency,
            discount: item.discount || 0,
            kdvRate: item.kdvRate || 20,
            productName: item.productName
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