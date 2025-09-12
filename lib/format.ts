/**
 * Shared utility functions for consistent currency formatting
 */

export type CurrencyCode = 'TL' | 'USD'

// Type for Prisma Decimal or similar objects
type DecimalLike = {
  toString(): string
}

type AmountValue = number | string | DecimalLike

/**
 * Formats a price with proper Turkish locale formatting
 * Handles Prisma Decimal types and ensures consistent display
 */
export function formatPrice(amount: AmountValue, currency: CurrencyCode): string {
  // Convert Prisma Decimal or any other type to number
  let numericAmount: number
  
  if (typeof amount === 'object' && amount !== null) {
    // Handle Prisma Decimal
    numericAmount = Number(amount.toString())
  } else if (typeof amount === 'string') {
    numericAmount = parseFloat(amount)
  } else {
    numericAmount = Number(amount)
  }

  // Validate the number
  if (isNaN(numericAmount) || !isFinite(numericAmount)) {
    return currency === 'TL' ? '₺0,00' : '$0.00'
  }

  // Format with Turkish locale
  const formatter = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const formattedAmount = formatter.format(numericAmount)
  
  // Return with appropriate currency symbol
  return currency === 'TL' ? `₺${formattedAmount}` : `$${formattedAmount}`
}

/**
 * Formats a compact price for small displays (K, M, B suffixes)
 */
export function formatCompactPrice(amount: AmountValue, currency: CurrencyCode): string {
  const numericAmount = typeof amount === 'object' ? Number(amount.toString()) : Number(amount)
  
  if (isNaN(numericAmount) || !isFinite(numericAmount)) {
    return currency === 'TL' ? '₺0' : '$0'
  }

  const formatter = new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    maximumFractionDigits: 1
  })

  const formattedAmount = formatter.format(numericAmount)
  return currency === 'TL' ? `₺${formattedAmount}` : `$${formattedAmount}`
}

/**
 * Safely converts any value to a number for calculations
 */
export function toNumber(value: AmountValue): number {
  if (typeof value === 'object' && value !== null) {
    return Number(value.toString())
  }
  return Number(value) || 0
}

/**
 * Calculates total from an array of items with proper Decimal handling
 */
export function calculateTotal(items: Record<string, AmountValue>[], field: string): number {
  return items.reduce((sum, item) => {
    const value = item[field]
    return sum + toNumber(value)
  }, 0)
}