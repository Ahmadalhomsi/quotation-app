// Temel türler ve enums
export enum Currency {
  TL = 'TL',
  USD = 'USD'
}

// Unified customer type system (replaces both status and labels)
export interface CustomerType {
  id: string
  name: string
  color: string
  description?: string
  category?: string // 'status', 'priority', 'source', 'behavior', 'custom'
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

// Customer type assignment (many-to-many)
export interface CustomerCustomerType {
  id: string
  customerId: string
  typeId: string
  type: CustomerType
  createdAt: Date
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
  companyName: string         // Şirket Adı
  contactName: string         // İletişim Kişisi
  email: string
  phone?: string
  address?: string
  taxNumber?: string          // Vergi Numarası
  taxOffice?: string          // Vergi Dairesi
  priority: number                    // Öncelik (1=Düşük, 2=Orta, 3=Yüksek)
  source?: string                     // Müşteri kaynağı
  notes?: string                      // Marketing notları
  lastContact?: Date                  // Son iletişim tarihi
  nextContact?: Date                  // Sonraki iletişim tarihi
  customerTypes?: CustomerCustomerType[] // Müşteri tipleri (unified status and labels)
  createdAt: Date
  updatedAt: Date
}

export interface CustomerActivity {
  id: string
  type: string           // Aktivite türü
  description?: string   // Aktivite açıklaması
  result?: string        // Aktivite sonucu
  nextAction?: string    // Sonraki eylem
  customerId: string
  createdBy?: string     // Aktiviteyi oluşturan kişi
  createdAt: Date
}

export interface CreateCustomerData {
  companyName: string
  contactName: string
  email?: string  // Make email optional
  phone?: string
  address?: string
  taxNumber?: string
  taxOffice?: string
  priority?: number
  source?: string
  notes?: string
  nextContact?: Date
  typeIds?: string[]  // For multiple customer types
}

// Ürün tipleri
export interface Product {
  id: string
  name: string           // Ürün Adı
  description?: string   // Açıklama
  price: number         // Satış Fiyatı
  purchasePrice?: number // Alış Fiyatı (maliyet)
  currency: Currency    // Para Birimi
  sku?: string          // Stok Kodu
  photoUrl?: string     // Ürün Fotoğrafı URL'i
  isActive: boolean     // Aktif mi
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  purchasePrice?: number
  currency: Currency
  sku?: string
  photoUrl?: string
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
  purchasePrice: string
  currency: Currency
  sku: string
  photo?: File
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
  statusId: string
  priority: number
  source: string
  notes: string
  nextContact: string
  labelIds: string[]
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

// These labels are now dynamic and come from the database

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
  price: { required: 'Satış fiyatı gereklidir', min: { value: 0.01, message: 'Fiyat 0\'dan büyük olmalı' } },
  purchasePrice: { min: { value: 0, message: 'Alış fiyatı 0\'dan küçük olamaz' } },
  currency: { required: 'Para birimi seçiniz' }
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