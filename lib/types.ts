// Temel türler ve enums
export enum Currency {
  TL = 'TL',
  USD = 'USD'
}

export enum ProductType {
  SOFTWARE = 'SOFTWARE', // Yazılım
  HARDWARE = 'HARDWARE'  // Donanım
}

export enum QuotationStatus {
  DRAFT = 'DRAFT',       // Taslak
  SENT = 'SENT',         // Gönderildi  
  ACCEPTED = 'ACCEPTED', // Kabul edildi
  REJECTED = 'REJECTED', // Reddedildi
  EXPIRED = 'EXPIRED'    // Süresi doldu
}

// Müşteri tipleri
export interface Customer {
  id: string
  companyName: string    // Şirket Adı
  contactName: string    // İletişim Kişisi
  email: string
  phone?: string
  address?: string
  taxNumber?: string     // Vergi Numarası
  taxOffice?: string     // Vergi Dairesi
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerData {
  companyName: string
  contactName: string
  email: string
  phone?: string
  address?: string
  taxNumber?: string
  taxOffice?: string
}

// Ürün tipleri
export interface Product {
  id: string
  name: string           // Ürün Adı
  description?: string   // Açıklama
  price: number         // Fiyat
  currency: Currency    // Para Birimi
  type: ProductType     // Ürün Tipi
  sku?: string          // Stok Kodu
  isActive: boolean     // Aktif mi
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  currency: Currency
  type: ProductType
  sku?: string
  isActive?: boolean
}

// Teklif kalemi tipleri
export interface QuotationItem {
  id: string
  quantity: number      // Miktar
  unitPrice: number     // Birim Fiyat
  totalPrice: number    // Toplam Fiyat
  currency: Currency    // Para Birimi
  discount?: number     // İskonto oranı (%)
  quotationId: string
  productId: string
  product: Product
  productName: string   // Ürün Adı (snapshot)
  productType: ProductType // Ürün Tipi (snapshot)
  createdAt: Date
  updatedAt: Date
}

export interface CreateQuotationItemData {
  productId: string
  quantity: number
  unitPrice: number
  currency: Currency
  discount?: number      // İskonto oranı (%)
}

// Teklif tipleri
export interface Quotation {
  id: string
  quotationNumber: string  // Teklif Numarası
  title: string           // Teklif Başlığı
  description?: string    // Açıklama
  status: QuotationStatus // Durum
  validUntil: Date        // Geçerlilik Tarihi
  customerId: string
  customer: Customer
  items: QuotationItem[]
  totalTL?: number        // Toplam TL
  totalUSD?: number       // Toplam USD
  exchangeRate?: number   // Döviz Kuru
  kdvEnabled?: boolean    // KDV dahil mi?
  kdvRate?: number       // KDV oranı (%)
  terms?: string          // Şartlar ve Koşullar
  notes?: string          // Notlar
  createdAt: Date
  updatedAt: Date
}

export interface CreateQuotationData {
  title: string
  description?: string
  validUntil: Date
  customerId: string
  items: CreateQuotationItemData[]
  terms?: string
  notes?: string
  kdvEnabled?: boolean    // KDV dahil mi?
  kdvRate?: number       // KDV oranı (%)
}

// Döviz kuru tipi
export interface ExchangeRate {
  id: string
  rate: number           // USD/TL Kuru
  date: Date
  source: string         // Kaynak
  createdAt: Date
}

// Form tipleri
export interface ProductFormData {
  name: string
  description: string
  price: string
  currency: Currency
  type: ProductType
  sku: string
  isActive: boolean
}

export interface CustomerFormData {
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  taxNumber: string
  taxOffice: string
}

export interface QuotationFormData {
  title: string
  description: string
  validUntil: string
  customerId: string
  terms: string
  notes: string
}

// API Response tipleri
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ExchangeRateApiResponse {
  success: boolean
  query: {
    from: string
    to: string
    amount: number
  }
  info: {
    timestamp: number
    rate: number
  }
  date: string
  result: number
}

// PDF Export tipleri
export interface PdfExportData {
  quotation: Quotation
  companyInfo: {
    name: string
    address?: string
    phone?: string
    email?: string
    website?: string
    taxNumber?: string
    taxOffice?: string
  }
  exchangeRate?: number
}

// Sayfa tipleri
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// Arama ve filtreleme
export interface ProductFilter {
  search?: string
  type?: ProductType
  currency?: Currency
  isActive?: boolean
  page?: number
  limit?: number
}

export interface CustomerFilter {
  search?: string
  page?: number
  limit?: number
}

export interface QuotationFilter {
  search?: string
  status?: QuotationStatus
  customerId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// Türkçe etiketler
export const CurrencyLabels: Record<Currency, string> = {
  [Currency.TL]: 'Türk Lirası',
  [Currency.USD]: 'Amerikan Doları'
}

export const ProductTypeLabels: Record<ProductType, string> = {
  [ProductType.SOFTWARE]: 'Yazılım',
  [ProductType.HARDWARE]: 'Donanım'
}

export const QuotationStatusLabels: Record<QuotationStatus, string> = {
  [QuotationStatus.DRAFT]: 'Taslak',
  [QuotationStatus.SENT]: 'Gönderildi',
  [QuotationStatus.ACCEPTED]: 'Kabul Edildi',
  [QuotationStatus.REJECTED]: 'Reddedildi',
  [QuotationStatus.EXPIRED]: 'Süresi Doldu'
}

// Form validation schemas (Zod ile kullanılacak)
export const ProductSchema = {
  name: { required: 'Ürün adı gereklidir', minLength: { value: 2, message: 'En az 2 karakter olmalı' } },
  price: { required: 'Fiyat gereklidir', min: { value: 0.01, message: 'Fiyat 0\'dan büyük olmalı' } },
  currency: { required: 'Para birimi seçiniz' },
  type: { required: 'Ürün tipi seçiniz' }
}

export const CustomerSchema = {
  companyName: { required: 'Şirket adı gereklidir' },
  contactName: { required: 'İletişim kişisi gereklidir' },
  email: { required: 'E-posta gereklidir', pattern: { value: /^\S+@\S+$/i, message: 'Geçerli e-posta giriniz' } }
}

export const QuotationSchema = {
  title: { required: 'Teklif başlığı gereklidir' },
  validUntil: { required: 'Geçerlilik tarihi gereklidir' },
  customerId: { required: 'Müşteri seçiniz' }
}