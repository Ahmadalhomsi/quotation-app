/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, generateUniqueFilename, isValidImageType, isValidFileSize } from '@/lib/minio'

import prisma from '@/lib/prisma'


// GET /api/products - Tüm ürünleri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    
    const where: { isActive?: boolean } = {}
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
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
    const formData = await request.formData()
    
    // Extract fields from FormData
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const purchasePrice = formData.get('purchasePrice') ? parseFloat(formData.get('purchasePrice') as string) : null
    const currency = formData.get('currency') as string
    const sku = formData.get('sku') as string
    const isActive = (formData.get('isActive') as string) === 'true'
    const kdvRate = formData.get('kdvRate') ? parseFloat(formData.get('kdvRate') as string) : 20
    const photo = formData.get('photo') as File | null
    
    // Validation
    if (!name || !price || !currency) {
      return NextResponse.json(
        { error: 'Ürün adı, fiyat ve para birimi gereklidir' },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Fiyat 0\'dan büyük olmalıdır' },
        { status: 400 }
      )
    }

    if (purchasePrice !== null && purchasePrice < 0) {
      return NextResponse.json(
        { error: 'Alış fiyatı 0\'dan küçük olamaz' },
        { status: 400 }
      )
    }

    // Check if SKU already exists (only if SKU is provided and not empty)
    if (sku && sku.trim()) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku: sku.trim() }
      })

      if (existingProduct) {
        return NextResponse.json(
          { error: 'Bu SKU kodu zaten kullanılıyor' },
          { status: 409 }
        )
      }
    }

    let photoUrl: string | null = null

    // Handle photo upload if provided
    if (photo && photo.size > 0) {
      // Validate file type
      if (!isValidImageType(photo.type)) {
        return NextResponse.json(
          { error: 'Sadece JPG, PNG ve WebP formatları desteklenir' },
          { status: 400 }
        )
      }

      // Validate file size (5MB max)
      if (!isValidFileSize(photo.size)) {
        return NextResponse.json(
          { error: 'Fotoğraf boyutu 5MB\'dan küçük olmalıdır' },
          { status: 400 }
        )
      }

      try {
        // Convert File to Buffer
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate unique filename
        const filename = generateUniqueFilename(photo.name)
        
        // Upload to MinIO
        photoUrl = await uploadFile(buffer, filename, photo.type)
        console.log('Fotoğraf başarıyla yüklendi:', photoUrl)
      } catch (uploadError) {
        console.error('Fotoğraf yükleme hatası:', uploadError)
        return NextResponse.json(
          { error: 'Fotoğraf yüklenemedi' },
          { status: 500 }
        )
      }
    }

    // Prepare data for database
    const productData = {
      name: name.trim(),
      description: description?.trim() || undefined,
      price,
      purchasePrice: purchasePrice || undefined,
      currency: currency as any,
      sku: sku && sku.trim() ? sku.trim() : undefined,
      photoUrl: photoUrl || undefined,
      isActive,
      kdvRate
    }

    const product = await prisma.product.create({
      data: productData
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    console.error('Ürün oluşturulurken hata:', error.stack)
    return NextResponse.json(
      { error: 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}