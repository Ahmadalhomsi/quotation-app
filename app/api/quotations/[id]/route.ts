import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: {
        id: params.id
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
  { params }: { params: { id: string } }
) {
  try {
    // First delete related items
    await prisma.quotationItem.deleteMany({
      where: {
        quotationId: params.id
      }
    })

    // Then delete the quotation
    await prisma.quotation.delete({
      where: {
        id: params.id
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