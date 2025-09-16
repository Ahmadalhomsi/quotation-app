import { NextRequest, NextResponse } from 'next/server'
import { ProductType as PrismaProductType } from '../../../generated/prisma'
import { uploadFile, generateUniqueFilename, isValidImageType, isValidFileSize, deleteFile, extractFilenameFromUrl } from '@/lib/minio'

import prisma from '@/lib/prisma'

// GET /api/products/[id] - Tek ürünü getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        quotationItems: {
          include: {
            quotation: {
              select: {
                id: true,
                quotationNumber: true,
                title: true,
                status: true,
                createdAt: true
              }
            }
          }
        },
        _count: {
          select: { quotationItems: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Ürün alınırken hata:', error)
    return NextResponse.json(
      { error: 'Ürün alınamadı' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Ürünü güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Get current product
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    
    // Extract fields from FormData
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const purchasePrice = formData.get('purchasePrice') ? parseFloat(formData.get('purchasePrice') as string) : null
    const currency = formData.get('currency') as string
    const type = formData.get('type') as string
    const sku = formData.get('sku') as string
    const isActive = (formData.get('isActive') as string) === 'true'
    const photo = formData.get('photo') as File | null
    const removePhoto = (formData.get('removePhoto') as string) === 'true'
    
    // Validation
    if (!name || !price || !currency || !type) {
      return NextResponse.json(
        { error: 'Ürün adı, fiyat, para birimi ve ürün tipi gereklidir' },
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

    // Check if SKU already exists (only if SKU is provided and different from current)
    if (sku && sku.trim() && sku.trim() !== existingProduct.sku) {
      const duplicateProduct = await prisma.product.findUnique({
        where: { sku: sku.trim() }
      })

      if (duplicateProduct) {
        return NextResponse.json(
          { error: 'Bu SKU kodu zaten kullanılıyor' },
          { status: 409 }
        )
      }
    }

    let photoUrl = existingProduct.photoUrl

    // Handle photo removal
    if (removePhoto && existingProduct.photoUrl) {
      try {
        const filename = extractFilenameFromUrl(existingProduct.photoUrl)
        if (filename) {
          await deleteFile(filename)
        }
      } catch (deleteError) {
        console.error('Eski fotoğraf silinirken hata:', deleteError)
        // Continue with update even if delete fails
      }
      photoUrl = null
    }

    // Handle new photo upload
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
        // Delete old photo if exists
        if (existingProduct.photoUrl) {
          try {
            const oldFilename = extractFilenameFromUrl(existingProduct.photoUrl)
            if (oldFilename) {
              await deleteFile(oldFilename)
            }
          } catch (deleteError) {
            console.error('Eski fotoğraf silinirken hata:', deleteError)
            // Continue with upload even if delete fails
          }
        }

        // Convert File to Buffer
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate unique filename
        const filename = generateUniqueFilename(photo.name, id)
        
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
    const updateData = {
      name: name.trim(),
      description: description?.trim() || null,
      price,
      purchasePrice: purchasePrice || null,
      currency: currency as 'TL' | 'USD',
      type: type as PrismaProductType,
      sku: sku && sku.trim() ? sku.trim() : null,
      photoUrl,
      isActive
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { quotationItems: true }
        }
      }
    })

    return NextResponse.json({ product })
  } catch (error: unknown) {
    console.error('Ürün güncellenirken hata:', error)
    return NextResponse.json(
      { error: 'Ürün güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Ürünü sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get product to delete associated photo
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    // Check if product is used in quotations
    const quotationItemsCount = await prisma.quotationItem.count({
      where: { productId: id }
    })

    if (quotationItemsCount > 0) {
      return NextResponse.json(
        { error: 'Bu ürün tekliflerde kullanıldığı için silinemez. Önce ürünü pasif yapabilirsiniz.' },
        { status: 409 }
      )
    }

    // Delete photo from MinIO if exists
    if (product.photoUrl) {
      try {
        const filename = extractFilenameFromUrl(product.photoUrl)
        if (filename) {
          await deleteFile(filename)
        }
      } catch (deleteError) {
        console.error('Fotoğraf silinirken hata:', deleteError)
        // Continue with product deletion even if photo delete fails
      }
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ürün silinirken hata:', error)
    return NextResponse.json(
      { error: 'Ürün silinemedi' },
      { status: 500 }
    )
  }
}