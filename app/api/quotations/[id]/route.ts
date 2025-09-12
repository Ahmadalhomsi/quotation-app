import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 FIXED: params is a Promise!
) {
  try {
    const resolvedParams = await params
    const quotation = await prisma.quotation.findUnique({
      where: {
        id: resolvedParams.id
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

    if (!quotation) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(quotation)
  } catch (error) {
    console.error('Teklif detayları alınırken hata:', error)
    return NextResponse.json(
      { error: 'Teklif detayları alınamadı' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 FIXED: params is a Promise!
) {
  try {
    const resolvedParams = await params

    // First delete related items
    await prisma.quotationItem.deleteMany({
      where: {
        quotationId: resolvedParams.id
      }
    })

    // Then delete the quotation
    await prisma.quotation.delete({
      where: {
        id: resolvedParams.id
      }
    })

    return NextResponse.json({ message: 'Teklif başarıyla silindi' })
  } catch (error) {
    console.error('Teklif silinirken hata:', error)
    return NextResponse.json(
      { error: 'Teklif silinemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    // Validation
    if (!body.title || !body.customerId || !body.validUntil) {
      return NextResponse.json(
        { error: 'Başlık, müşteri ve geçerlilik tarihi gereklidir' },
        { status: 400 }
      )
    }

    // Check if quotation exists
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingQuotation) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
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

    // Calculate totals if items are provided
    let totalTL = 0
    let totalUSD = 0
    const exchangeRate = body.exchangeRate || existingQuotation.exchangeRate || 40.0

    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        if (item.currency === 'TL') {
          totalTL += item.totalPrice
          totalUSD += item.totalPrice / exchangeRate
        } else {
          totalUSD += item.totalPrice
          totalTL += item.totalPrice * exchangeRate
        }
      }
    } else {
      // Keep existing totals if no items provided
      totalTL = existingQuotation.totalTL ? Number(existingQuotation.totalTL) : 0
      totalUSD = existingQuotation.totalUSD ? Number(existingQuotation.totalUSD) : 0
    }

    // Update quotation
    const updatedQuotation = await prisma.quotation.update({
      where: { id: resolvedParams.id },
      data: {
        title: body.title,
        description: body.description,
        customerId: body.customerId,
        validUntil: new Date(body.validUntil),
        status: body.status || existingQuotation.status,
        totalTL,
        totalUSD,
        exchangeRate,
        terms: body.terms,
        notes: body.notes
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

    // Update items if provided
    if (body.items && body.items.length > 0) {
      // Delete existing items only if we have new items to replace them
      await prisma.quotationItem.deleteMany({
        where: { quotationId: resolvedParams.id }
      })

      // Create new items
      await prisma.quotationItem.createMany({
        data: body.items.map((item: {
          productId: string;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          currency: string;
          productName: string;
          productType: string;
        }) => ({
          quotationId: resolvedParams.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          currency: item.currency,
          productName: item.productName,
          productType: item.productType
        }))
      })

      // Fetch the updated quotation with items
      const finalQuotation = await prisma.quotation.findUnique({
        where: { id: resolvedParams.id },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      })

      return NextResponse.json({ quotation: finalQuotation })
    }

    return NextResponse.json({ quotation: updatedQuotation })
  } catch (error) {
    console.error('Teklif güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Teklif güncellenemedi' },
      { status: 500 }
    )
  }
}