import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalQuotations,
      activeProducts,
      totalCustomers,
      monthlyQuotations
    ] = await Promise.all([
      prisma.quotation.count(),
      prisma.product.count({
        where: { isActive: true }
      }),
      prisma.customer.count(),
      prisma.quotation.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    // Get current USD/TL exchange rate (you can implement a real API call here)
    const exchangeRate = 34.50 // Placeholder - you can integrate with a real exchange rate API

    return NextResponse.json({
      stats: {
        totalQuotations,
        activeProducts,
        totalCustomers,
        monthlyQuotations,
        exchangeRate
      }
    })
  } catch (error) {
    console.error('Dashboard istatistikleri alınırken hata:', error)
    return NextResponse.json(
      { error: 'İstatistikler alınamadı' },
      { status: 500 }
    )
  }
}