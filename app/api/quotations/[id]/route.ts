import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

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