/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X, Plus, Trash2, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { QuotationStatus, QuotationStatusLabels, ProductType, ProductTypeLabels, Currency } from '@/lib/types'
import { generatePDF } from '@/lib/pdf-generator'

// Types matching the API response
interface QuotationDetail {
  id: string
  quotationNumber: string
  title: string
  description: string | null
  status: QuotationStatus
  customerId: string
  customer: {
    id: string
    companyName: string
    contactName: string
    email: string
    phone: string | null
    address: string | null
    taxNumber: string | null
    taxOffice: string | null
  }
  totalTL: number | null
  totalUSD: number | null
  exchangeRate: number
  validUntil: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    quotationId: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    currency: Currency
    product: {
      id: string
      name: string
      type: ProductType
      price: number
      currency: Currency
      description: string | null
    }
  }>
  terms: string | null
  notes: string | null
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: Currency
  type: ProductType
  sku: string | null
  isActive: boolean
}

interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  address: string | null
  taxNumber: string | null
  taxOffice: string | null
}

interface QuotationItem {
  id?: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: Currency
  productName?: string
}

interface QuotationFormData {
  title: string
  description: string
  customerId: string
  status: QuotationStatus
  validUntil: string
  items: QuotationItem[]
  terms: string
  notes: string
  exchangeRate: number
}

function formatCurrency(amount: number, currency?: Currency): string {
  const curr = currency ?? ('TL' as Currency)
  const locale = curr === 'USD' ? 'en-US' : 'tr-TR'
  const currencyCode = curr === 'USD' ? 'USD' : 'TRY'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export default function QuotationEditPage() {
  const params = useParams()
  const router = useRouter()
  const quotationId = params.id as string
  
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  
  const [formData, setFormData] = useState<QuotationFormData>({
    title: '',
    description: '',
    customerId: '',
    status: 'DRAFT' as QuotationStatus,
    validUntil: '',
    items: [],
    terms: '',
    notes: '',
    exchangeRate: 30.0
  })

  // Load quotation data
  useEffect(() => {
    if (quotationId) {
      fetchQuotation()
    }
  }, [quotationId])

  const fetchQuotation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quotations/${quotationId}`)
      
      if (!response.ok) {
        throw new Error('Teklif yüklenemedi')
      }
      
      const data: QuotationDetail = await response.json()
      setQuotation(data)
      
      // Update form data
      setFormData({
        title: data.title,
        description: data.description || '',
        customerId: data.customerId,
        status: data.status,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '',
        items: data.items.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          currency: item.currency,
          productName: item.product.name
        })),
        terms: data.terms || '',
        notes: data.notes || '',
        exchangeRate: data.exchangeRate
      })
    } catch (error) {
      console.error('Error fetching quotation:', error)
      alert('Teklif yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Load customers
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const response = await fetch('/api/customers')
      
      if (!response.ok) {
        throw new Error('Müşteriler yüklenemedi')
      }
      
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  // Load products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)
      const response = await fetch('/api/products')
      
      if (!response.ok) {
        throw new Error('Ürünler yüklenemedi')
      }
      
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Load customers and products on component mount
  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || formData.items.length === 0) {
      alert('Lütfen müşteri seçin ve en az bir ürün ekleyin')
      return
    }

    try {
      setSaving(true)
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        customerId: formData.customerId,
        status: formData.status,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          currency: item.currency
        })),
        terms: formData.terms,
        notes: formData.notes,
        exchangeRate: formData.exchangeRate
      }
      
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Teklif güncellenemedi')
      }
      
      alert('Teklif başarıyla güncellendi!')
      router.push('/teklifler')
    } catch (error) {
      console.error('Error updating quotation:', error)
      alert(error instanceof Error ? error.message : 'Teklif güncellenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        currency: 'TL' as Currency
      }]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      const item = newItems[index]
      
      if (field === 'productId') {
        const product = products.find(p => p.id === value)
        if (product) {
          item.productId = value
          item.unitPrice = product.price
          item.currency = product.currency
          item.productName = product.name
          item.totalPrice = item.quantity * product.price
        }
      } else if (field === 'quantity') {
        item.quantity = Number(value)
        item.totalPrice = item.quantity * item.unitPrice
      } else if (field === 'unitPrice') {
        item.unitPrice = Number(value)
        item.totalPrice = item.quantity * item.unitPrice
      } else {
        (item as any)[field] = value
        if (field === 'currency') {
          item.totalPrice = item.quantity * item.unitPrice
        }
      }
      
      newItems[index] = item
      return { ...prev, items: newItems }
    })
  }

  const calculateTotals = () => {
    const itemsByCategory = formData.items.reduce((acc, item) => {
      if (!acc[item.currency]) {
        acc[item.currency] = 0
      }
      acc[item.currency] += item.totalPrice
      return acc
    }, {} as Record<Currency, number>)

    const totalTL = (itemsByCategory.TL || 0) + ((itemsByCategory.USD || 0) * formData.exchangeRate)
    const totalUSD = (itemsByCategory.USD || 0) + ((itemsByCategory.TL || 0) / formData.exchangeRate)
    
    return { totalTL, totalUSD, itemsByCategory }
  }

  const handleDownloadPDF = () => {
    if (!quotation) {
      alert('Teklif verisi yüklenemedi')
      return
    }

    try {
      // Create PDF data object with string dates
      const pdfData = {
        ...quotation,
        createdAt: quotation.createdAt,
        validUntil: quotation.validUntil
      }
      
      generatePDF(pdfData)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('PDF oluşturulurken hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center text-red-600">Teklif bulunamadı</div>
        </div>
      </div>
    )
  }

  const { totalTL, totalUSD, itemsByCategory } = calculateTotals()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teklifler">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teklif Düzenle</h1>
              <p className="text-gray-600">Teklif No: {quotation.quotationNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF İndir
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Teklif Başlığı</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Teklif başlığı"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customer">Müşteri</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCustomers ? (
                        <SelectItem value="" disabled>Yükleniyor...</SelectItem>
                      ) : (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.companyName} - {customer.contactName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: QuotationStatus) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(QuotationStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="validUntil">Geçerlilik Tarihi</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="exchangeRate">Döviz Kuru (USD/TL)</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.01"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: Number(e.target.value) }))}
                    placeholder="30.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Teklif açıklaması..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ürünler ve Hizmetler
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ürün Ekle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Henüz ürün eklenmemiş. Yukarıdaki butonu kullanarak ürün ekleyin.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label>Ürün</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(index, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Ürün seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingProducts ? (
                                <SelectItem value="" disabled>Yükleniyor...</SelectItem>
                              ) : (
                                products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - {formatCurrency(product.price, product.currency)}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Miktar</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Birim Fiyat</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Para Birimi</Label>
                          <Select
                            value={item.currency}
                            onValueChange={(value: Currency) => updateItem(index, 'currency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TL">TL</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <Label>Toplam</Label>
                            <div className="font-semibold">
                              {formatCurrency(item.totalPrice, item.currency)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          {formData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Toplam Tutar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(itemsByCategory).map(([currency, amount]) => (
                    <div key={currency} className="flex justify-between">
                      <span>Ara Toplam ({currency}):</span>
                      <span className="font-semibold">{formatCurrency(amount, currency as Currency)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Toplam (TL):</span>
                      <span>{formatCurrency(totalTL, 'TL' as Currency)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Toplam (USD):</span>
                      <span>{formatCurrency(totalUSD, 'USD' as Currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Şartlar ve Notlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="terms">Şartlar</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Ödeme şartları, teslimat koşulları vb..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ek notlar..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Link href="/teklifler">
              <Button type="button" variant="outline">
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}