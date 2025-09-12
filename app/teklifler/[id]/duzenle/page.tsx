'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'

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
}

interface QuotationItem {
  productId: string
  quantity: number
  unitPrice: number
  currency: Currency
  product?: Product
}

export default function EditQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [status, setStatus] = useState<QuotationStatus>(QuotationStatus.DRAFT)
  const [terms, setTerms] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<QuotationItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch quotation, products, and customers in parallel
        const [quotationRes, productsRes, customersRes] = await Promise.all([
          fetch(`/api/quotations/${params.id}`),
          fetch('/api/products?active=true'),
          fetch('/api/customers')
        ])

        if (!quotationRes.ok) {
          throw new Error('Teklif bulunamadı')
        }

        const quotationData = await quotationRes.json()
        const productsData = productsRes.ok ? await productsRes.json() : { products: [] }
        const customersData = customersRes.ok ? await customersRes.json() : { customers: [] }

        setQuotation(quotationData)
        setProducts(productsData.products || [])
        setCustomers(customersData.customers || [])

        // Initialize form state with quotation data
        setTitle(quotationData.title)
        setDescription(quotationData.description || '')
        setCustomerId(quotationData.customerId)
        setValidUntil(quotationData.validUntil.split('T')[0]) // Convert to date input format
        setStatus(quotationData.status)
        setTerms(quotationData.terms || '')
        setNotes(quotationData.notes || '')
        
        // Convert items to form format
        const formItems = quotationData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          currency: item.currency,
          product: item.product
        }))
        setItems(formItems)

      } catch (error) {
        console.error('Veriler yüklenemedi:', error)
        setError(error instanceof Error ? error.message : 'Veriler yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleAddItem = () => {
    setItems([...items, {
      productId: '',
      quantity: 1,
      unitPrice: 0,
      currency: Currency.TL
    }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items]
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          unitPrice: product.price,
          currency: product.currency,
          product
        }
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    
    setItems(newItems)
  }

  const calculateTotal = (currency: Currency) => {
    return items
      .filter(item => item.currency === currency)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const updatedQuotation = {
        title,
        description: description || null,
        customerId,
        validUntil: new Date(validUntil).toISOString(),
        status,
        terms: terms || null,
        notes: notes || null,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          currency: item.currency
        }))
      }

      const response = await fetch(`/api/quotations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedQuotation)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Teklif güncellenemedi')
      }

      alert('Teklif başarıyla güncellendi')
      router.push(`/teklifler/${params.id}`)

    } catch (error) {
      console.error('Kaydetme hatası:', error)
      alert(error instanceof Error ? error.message : 'Teklif kaydedilirken bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/teklifler">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Teklif Düzenle</h1>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Veriler yükleniyor...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !quotation) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/teklifler">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Teklif Düzenle</h1>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium mb-2">Hata</h3>
              <p className="text-muted-foreground mb-4">{error || 'Teklif bulunamadı'}</p>
              <Button asChild>
                <Link href="/teklifler">Tekliflere Dön</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Başlık */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/teklifler/${quotation.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Teklif Düzenle</h1>
              <p className="text-muted-foreground">{quotation.quotationNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/teklifler/${quotation.id}`}>
                <X className="mr-2 h-4 w-4" />
                İptal
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>

        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Teklif Başlığı *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Teklif başlığını giriniz"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer">Müşteri *</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.companyName} - {customer.contactName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Geçerlilik Tarihi *</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select value={status} onValueChange={(value: QuotationStatus) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(QuotationStatus).map((statusValue) => (
                      <SelectItem key={statusValue} value={statusValue}>
                        {QuotationStatusLabels[statusValue]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Teklif açıklaması (isteğe bağlı)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Teklif Kalemleri */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Teklif Kalemleri</CardTitle>
              <Button onClick={handleAddItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Kalem Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Henüz teklif kalemi eklenmemiş</p>
                <Button onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Kalemi Ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="md:col-span-2 space-y-2">
                        <Label>Ürün *</Label>
                        <Select 
                          value={item.productId} 
                          onValueChange={(value) => handleItemChange(index, 'productId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ürün seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex flex-col">
                                  <span>{product.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {ProductTypeLabels[product.type]} - {product.currency === Currency.TL ? '₺' : '$'}{product.price}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Miktar *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Birim Fiyat *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Para Birimi</Label>
                        <Select 
                          value={item.currency} 
                          onValueChange={(value: Currency) => handleItemChange(index, 'currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Currency.TL}>₺ TL</SelectItem>
                            <SelectItem value={Currency.USD}>$ USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Toplam</Label>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {item.currency === Currency.TL ? '₺' : '$'}
                            {(item.quantity * item.unitPrice).toFixed(2)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toplam */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Toplam Tutar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Toplam TL</Label>
                  <div className="text-2xl font-bold">
                    ₺{calculateTotal(Currency.TL).toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Toplam USD</Label>
                  <div className="text-2xl font-bold">
                    ${calculateTotal(Currency.USD).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Şartlar ve Notlar */}
        <Card>
          <CardHeader>
            <CardTitle>Şartlar ve Notlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="terms">Şartlar ve Koşullar</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Teklif şartları ve koşulları (isteğe bağlı)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dahili notlar (isteğe bağlı)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Mock products for selection
const mockProducts = [
  {
    id: '1',
    name: 'MAPOS Pro POS Yazılımı',
    type: ProductType.SOFTWARE,
    price: 2500,
    currency: 'TL'
  },
  {
    id: '2',
    name: 'Touch Screen Monitor 15"',
    type: ProductType.HARDWARE,
    price: 299,
    currency: 'USD'
  },
  {
    id: '3',
    name: 'POS Printer 80mm',
    type: ProductType.HARDWARE,
    price: 150,
    currency: 'USD'
  }
]

interface QuotationEditItem {
  id: string
  productId: string
  productName: string
  productType: ProductType
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: string
}

export default function QuotationEditPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<QuotationStatus>(QuotationStatus.DRAFT)
  const [validUntil, setValidUntil] = useState('')
  const [terms, setTerms] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<QuotationEditItem[]>([])

  // Customer info (read-only in edit)
  const [customer, setCustomer] = useState<typeof mockQuotations[0]['customer'] | null>(null)

  useEffect(() => {
    // Simulate API call to load quotation
    const fetchQuotation = async () => {
      try {
        const found = mockQuotations.find(q => q.id === params.id)
        if (found) {
          setTitle(found.title)
          setDescription(found.description)
          setStatus(found.status)
          setValidUntil(found.validUntil.toISOString().split('T')[0])
          setTerms(found.terms)
          setNotes(found.notes)
          setItems(found.items)
          setCustomer(found.customer)
        }
      } catch (error) {
        console.error('Teklif yüklenemedi:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuotation()
  }, [params.id])

  const formatPrice = (price: number, currency: 'TL' | 'USD') => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    const formattedPrice = formatter.format(price)
    return currency === 'TL' ? `${formattedPrice} ₺` : `$${formattedPrice}`
  }

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const calculateTotals = () => {
    let totalTL = 0
    let totalUSD = 0

    items.forEach(item => {
      if (item.currency === 'TL') {
        totalTL += item.totalPrice
      } else {
        totalUSD += item.totalPrice
      }
    })

    return { totalTL, totalUSD }
  }

  const addItem = () => {
    const newItem: QuotationEditItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      productType: ProductType.SOFTWARE,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      currency: 'TL'
    }
    setItems([...items, newItem])
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const updateItem = (itemId: string, field: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        
        // Auto-calculate total when quantity or price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = calculateItemTotal(updatedItem.quantity, updatedItem.unitPrice)
        }

        // Auto-fill product details when product is selected
        if (field === 'productId' && value) {
          const product = mockProducts.find(p => p.id === value)
          if (product) {
            updatedItem.productName = product.name
            updatedItem.productType = product.type
            updatedItem.unitPrice = product.price
            updatedItem.currency = product.currency
            updatedItem.totalPrice = calculateItemTotal(updatedItem.quantity, product.price)
          }
        }

        return updatedItem
      }
      return item
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: API call to save quotation
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      alert('Teklif başarıyla güncellendi!')
      router.push(`/teklifler/${params.id}`)
    } catch (error) {
      console.error('Kaydetme hatası:', error)
      alert('Teklif kaydedilemedi. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  const totals = calculateTotals()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/teklifler/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teklif Düzenle</h1>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teklifler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teklif Bulunamadı</h1>
            <p className="text-muted-foreground">
              Bu teklif bulunamadı veya silinmiş olabilir.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/teklifler/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teklif Düzenle</h1>
            <p className="text-muted-foreground">{customer.companyName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/teklifler/${params.id}`}>
              <X className="mr-2 h-4 w-4" />
              İptal
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="title">Teklif Başlığı</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Teklif başlığını girin"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as QuotationStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(QuotationStatus).map((statusValue) => (
                        <SelectItem key={statusValue} value={statusValue}>
                          {QuotationStatusLabels[statusValue]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Teklif açıklamasını girin"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Geçerlilik Tarihi</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Ürünler ({items.length})</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ürün Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Henüz ürün eklenmemiş.</p>
                  <Button onClick={addItem} className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Ürünü Ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Ürün #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <Label>Ürün Seç</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(item.id, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Ürün seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Miktar</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <Label>Birim Fiyat</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <Label>Para Birimi</Label>
                          <Select
                            value={item.currency}
                            onValueChange={(value) => updateItem(item.id, 'currency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TL">₺ TL</SelectItem>
                              <SelectItem value="USD">$ USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {item.productName && (
                        <div className="pt-2 border-t">
                          <div className="grid gap-2 md:grid-cols-3">
                            <div>
                              <span className="text-sm text-muted-foreground">Ürün: </span>
                              <span className="font-medium">{item.productName}</span>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Tip: </span>
                              <Badge variant="outline">
                                {ProductTypeLabels[item.productType]}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Toplam: </span>
                              <span className="font-mono font-bold">
                                {formatPrice(item.totalPrice, item.currency as 'TL' | 'USD')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Terms and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Ek Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="terms">Şartlar ve Koşullar</Label>
                <Textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Ödeme şartları, teslimat koşulları vb."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ek notlar ve açıklamalar"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Şirket:</span>
                <p className="font-medium">{customer.companyName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">İletişim:</span>
                <p>{customer.contactName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">E-posta:</span>
                <p className="text-sm">{customer.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Telefon:</span>
                <p className="text-sm">{customer.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Toplam Tutar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {totals.totalTL > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Toplam (TL):</span>
                    <span className="font-mono font-bold">
                      {formatPrice(totals.totalTL, 'TL')}
                    </span>
                  </div>
                )}
                {totals.totalUSD > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Toplam (USD):</span>
                    <span className="font-mono font-bold">
                      {formatPrice(totals.totalUSD, 'USD')}
                    </span>
                  </div>
                )}
                {(totals.totalTL === 0 && totals.totalUSD === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Ürün ekleyince toplam tutar görünecek
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <Card>
            <CardHeader>
              <CardTitle>İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/teklifler/${params.id}`}>
                  <X className="mr-2 h-4 w-4" />
                  İptal Et
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}