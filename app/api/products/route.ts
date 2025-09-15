/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { ProductType } from '../../generated/prisma'
import { CreateProductData } from '@/lib/types'

import prisma from '@/lib/prisma'


// GET /api/products - Tüm ürünleri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    const type = searchParams.get('type')
    
    const where: { isActive?: boolean; type?: ProductType } = {}
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    if (type && (type === 'SOFTWARE' || type === 'HARDWARE')) {
      where.type = type as ProductType
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: { quotationItems: true }
        }
      }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Ürünler alınırken hata:', error)
    return NextResponse.json(
      { error: 'Ürünler alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/products - Yeni ürün oluştur
export async function POST(request: NextRequest) {
  try {
    const body: CreateProductData = await request.json()
    
    // Validation
    if (!body.name || !body.price || !body.currency || !body.type) {
      return NextResponse.json(
        { error: 'Ürün adı, fiyat, para birimi ve ürün tipi gereklidir' },
        { status: 400 }
      )
    }

    if (body.price <= 0) {
      return NextResponse.json(
        { error: 'Fiyat 0\'dan büyük olmalıdır' },
        { status: 400 }
      )
    }

    // Check if SKU already exists (only if SKU is provided and not empty)
    if (body.sku && body.sku.trim()) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku: body.sku.trim() }
      })

      if (existingProduct) {
        return NextResponse.json(
          { error: 'Bu SKU kodu zaten kullanılıyor' },
          { status: 409 }
        )
      }
    }

    // Clean up the data before saving
    const productData = {
      ...body,
      sku: body.sku && body.sku.trim() ? body.sku.trim() : null
    }

    const product = await prisma.product.create({
      data: productData
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error : any) {
    console.error('Ürün oluşturulurken hata:', error.stack)
    return NextResponse.json(
      { error: 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}