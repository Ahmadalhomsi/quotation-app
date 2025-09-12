// Currency exchange service for USD/TL conversion

// Free Exchange Rate API - exchangerate-api.com
const EXCHANGE_API_BASE = 'https://api.exchangerate-api.com/v4/latest'
const FALLBACK_RATE = 30.0 // Fallback USD/TL kuru

export class CurrencyService {
  private static instance: CurrencyService
  private cachedRate: { rate: number; timestamp: number } | null = null
  private readonly CACHE_DURATION = 60 * 60 * 1000 // 1 saat cache

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

  /**
   * USD/TL döviz kurunu getirir
   */
  async getUsdToTryRate(): Promise<number> {
    try {
      // Cache kontrolü
      if (this.cachedRate && Date.now() - this.cachedRate.timestamp < this.CACHE_DURATION) {
        return this.cachedRate.rate
      }

      // API'den kur bilgisi al
      const response = await fetch(`${EXCHANGE_API_BASE}/USD`)
      
      if (!response.ok) {
        console.warn('Exchange rate API yanıt vermedi, fallback kur kullanılıyor')
        return FALLBACK_RATE
      }

      const data = await response.json()
      const rate = data.rates?.TRY

      if (!rate || typeof rate !== 'number' || rate <= 0) {
        console.warn('Geçersiz kur bilgisi, fallback kur kullanılıyor')
        return FALLBACK_RATE
      }

      // Cache'e kaydet
      this.cachedRate = {
        rate,
        timestamp: Date.now()
      }

      return rate
    } catch (error) {
      console.error('Döviz kuru alınamadı:', error)
      return FALLBACK_RATE
    }
  }

  /**
   * USD tutarını TL'ye çevirir
   */
  async convertUsdToTry(usdAmount: number): Promise<number> {
    const rate = await this.getUsdToTryRate()
    return usdAmount * rate
  }

  /**
   * TL tutarını USD'ye çevirir
   */
  async convertTryToUsd(tryAmount: number): Promise<number> {
    const rate = await this.getUsdToTryRate()
    return tryAmount / rate
  }

  /**
   * Para birimini dönüştürür
   */
  async convertCurrency(
    amount: number,
    fromCurrency: 'USD' | 'TL',
    toCurrency: 'USD' | 'TL'
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount
    }

    if (fromCurrency === 'USD' && toCurrency === 'TL') {
      return this.convertUsdToTry(amount)
    }

    if (fromCurrency === 'TL' && toCurrency === 'USD') {
      return this.convertTryToUsd(amount)
    }

    return amount
  }

  /**
   * Formatlanmış para birimi string'i döndürür
   */
  formatCurrency(amount: number, currency: 'USD' | 'TL'): string {
    const formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    const formattedAmount = formatter.format(amount)
    
    if (currency === 'TL') {
      return `${formattedAmount} ₺`
    } else {
      return `$${formattedAmount}`
    }
  }

  /**
   * Cache'i temizler
   */
  clearCache(): void {
    this.cachedRate = null
  }

  /**
   * Mevcut kur bilgisini döndürür (cache'den)
   */
  getCachedRate(): number | null {
    if (this.cachedRate && Date.now() - this.cachedRate.timestamp < this.CACHE_DURATION) {
      return this.cachedRate.rate
    }
    return null
  }
}

// Singleton instance
export const currencyService = CurrencyService.getInstance()

// Utility functions
export async function getExchangeRate(): Promise<number> {
  return currencyService.getUsdToTryRate()
}

export async function convertCurrency(
  amount: number,
  from: 'USD' | 'TL',
  to: 'USD' | 'TL'
): Promise<number> {
  return currencyService.convertCurrency(amount, from, to)
}

export function formatMoney(amount: number, currency: 'USD' | 'TL'): string {
  return currencyService.formatCurrency(amount, currency)
}

// React hook için utility
export function useCurrencyConverter() {
  return {
    convertUsdToTry: (amount: number) => currencyService.convertUsdToTry(amount),
    convertTryToUsd: (amount: number) => currencyService.convertTryToUsd(amount),
    getExchangeRate: () => currencyService.getUsdToTryRate(),
    formatCurrency: (amount: number, currency: 'USD' | 'TL') => 
      currencyService.formatCurrency(amount, currency)
  }
}