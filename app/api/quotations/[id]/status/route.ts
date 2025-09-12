import { NextRequest, NextResponse } from 'next/server'
import { QuotationStatus } from '../../../../generated/prisma'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()

    // Validate status
    if (!body.status || !Object.values(QuotationStatus).includes(body.status)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum değeri gereklidir' },
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

    // Update only the status
    const updatedQuotation = await prisma.quotation.update({
      where: { id: resolvedParams.id },
      data: {
        status: body.status
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

    return NextResponse.json({ quotation: updatedQuotation })
  } catch (error) {
    console.error('Durum güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Durum güncellenemedi' },
      { status: 500 }
    )
  }
}