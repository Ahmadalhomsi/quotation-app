import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const VALID_CALL_STATUSES = ['arandı', '1 daha ara', 'takip et']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()

    // Validate call status
    if (!body.callStatus || !VALID_CALL_STATUSES.includes(body.callStatus)) {
      return NextResponse.json(
        { error: 'Geçerli bir arama durumu değeri gereklidir' },
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

    // Update only the call status
    // Note: callStatus field will be available after running prisma generate
    const updatedQuotation = await prisma.quotation.update({
      where: { id: resolvedParams.id },
      data: {
        ...(body.callStatus && { callStatus: body.callStatus })
      }
    })

    return NextResponse.json({ quotation: updatedQuotation })
  } catch (error) {
    console.error('Arama durumu güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Arama durumu güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}