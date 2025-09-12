'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Plus, 
  Trash2, 
  Calculator,
  User,
  Package,
  DollarSign
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Currency, 
  ProductType, 
  CreateQuotationData,
  CreateQuotationItemData 
} from '@/lib/types'
import { currencyService } from '@/lib/currency'

// Types for API data
interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
}

interface Product {
  id: string
  name: string
  price: number
  currency: Currency
  type: ProductType
  description?: string
}

interface QuotationItem extends CreateQuotationItemData {
  id: string
  product?: Product
  totalPrice: number
}

export default function NewQuotationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number>(30)
  
  // Data states
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CreateQuotationData>({
    title: '',
    description: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
    customerId: '',
    items: [],
    terms: '',
    notes: ''
  })

  const [items, setItems] = useState<QuotationItem[]>([])
  const [newItem, setNewItem] = useState<Partial<QuotationItem>>({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    currency: Currency.TL
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        
        const [customersResponse, productsResponse] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products?active=true')
        ])

        if (!customersResponse.ok) {
          throw new Error('Müşteriler alınamadı')
        }
        
        if (!productsResponse.ok) {
          throw new Error('Ürünler alınamadı')
        }

        const customersData = await customersResponse.json()
        const productsData = await productsResponse.json()

        setCustomers(customersData.customers || [])
        setProducts(productsData.products || [])
        
        // Get exchange rate
        try {
          const rate = await currencyService.getUsdToTryRate()
          setExchangeRate(rate)
        } catch (rateError) {
          console.error('Döviz kuru alınamadı:', rateError)
          // Use default rate of 30 if API fails
        }
        
      } catch (error) {
        console.error('Veri yükleme hatası:', error)
        setError(error instanceof Error ? error.message : 'Veriler yüklenirken hata oluştu')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const formatPrice = (price: number, currency: Currency) => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    const formattedPrice = formatter.format(price)
    return currency === Currency.TL ? `₺${formattedPrice}` : `$${formattedPrice}`
  }

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const calculateQuotationTotals = () => {
    let totalTL = 0
    let totalUSD = 0

    items.forEach(item => {
      if (item.currency === Currency.TL) {
        totalTL += item.totalPrice
      } else {
        totalUSD += item.totalPrice
        totalTL += item.totalPrice * exchangeRate
      }
    })

    return { totalTL, totalUSD }
  }

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.unitPrice) {
      return
    }

    const product = products.find(p => p.id === newItem.productId)
    if (!product) return

    const item: QuotationItem = {
      id: Date.now().toString(),
      productId: newItem.productId,
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice || 0,
      currency: newItem.currency || Currency.TL,
      product,
      totalPrice: calculateItemTotal(newItem.quantity || 1, newItem.unitPrice || 0)
    }

    setItems(prev => [...prev, item])
    setNewItem({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      currency: Currency.TL
    })
  }

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity, totalPrice: calculateItemTotal(quantity, item.unitPrice) }
        : item
    ))
  }

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setNewItem(prev => ({
        ...prev,
        productId,
        unitPrice: Number(product.price),
        currency: product.currency
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Teklif başlığı gereklidir'
    }

    if (!formData.customerId) {
      newErrors.customerId = 'Müşteri seçmelisiniz'
    }

    if (items.length === 0) {
      newErrors.items = 'En az bir ürün eklemelisiniz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const quotationData = {
        ...formData,
        exchangeRate,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          currency: item.currency,
          productName: item.product?.name || '',
          productType: item.product?.type || ProductType.SOFTWARE
        }))
      }

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quotationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Teklif oluşturulamadı')
      }

      // Başarılı olursa teklifler sayfasına yönlendir
      router.push('/teklifler')
    } catch (error) {
      console.error('Teklif oluşturma hatası:', error)
      setError(error instanceof Error ? error.message : 'Teklif oluşturulurken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const { totalTL, totalUSD } = calculateQuotationTotals()

  // Loading state
  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teklifler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Yeni Teklif Oluştur</h1>
            <p className="text-muted-foreground">Veriler yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teklifler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hata</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium mb-2">Veriler Yüklenemedi</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teklifler">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yeni Teklif Oluştur</h1>
          <p className="text-muted-foreground">
            Müşteriniz için yeni teklif hazırlayın
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ana Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teklif Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Teklif Bilgileri</span>
                </CardTitle>
                <CardDescription>
                  Temel teklif bilgilerini girin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Teklif Başlığı *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Örn: POS Sistemi Teklifi"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerId">Müşteri *</Label>
                    <Select 
                      value={formData.customerId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                    >
                      <SelectTrigger className={errors.customerId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={customers.length === 0 ? "Müşteri bulunamadı" : "Müşteri seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.customerId && (
                      <p className="text-sm text-red-500">{errors.customerId}</p>
                    )}
                    {customers.length === 0 && (
                      <p className="text-sm text-amber-600">
                        Veritabanında müşteri bulunamadı. Önce müşteri eklemeniz gerekiyor.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Teklif hakkında detaylı açıklama..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validUntil">Geçerlilik Tarihi</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil.toISOString().split('T')[0]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      validUntil: new Date(e.target.value) 
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ürün Ekleme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Ürün Ekle</span>
                </CardTitle>
                <CardDescription>
                  Teklife ürün ekleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Ürün</Label>
                    <Select 
                      value={newItem.productId} 
                      onValueChange={handleProductSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={products.length === 0 ? "Ürün bulunamadı" : "Ürün seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {products.length === 0 && (
                      <p className="text-sm text-amber-600">
                        Veritabanında ürün bulunamadı. Önce ürün eklemeniz gerekiyor.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Miktar</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ 
                        ...prev, 
                        quantity: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Birim Fiyat</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newItem.unitPrice}
                        onChange={(e) => setNewItem(prev => ({ 
                          ...prev, 
                          unitPrice: parseFloat(e.target.value) || 0 
                        }))}
                        className="rounded-r-none"
                      />
                      <Select 
                        value={newItem.currency} 
                        onValueChange={(value) => setNewItem(prev => ({ 
                          ...prev, 
                          currency: value as Currency 
                        }))}
                      >
                        <SelectTrigger className="w-20 rounded-l-none border-l-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Currency.TL}>₺</SelectItem>
                          <SelectItem value={Currency.USD}>$</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      onClick={addItem} 
                      className="w-full"
                      disabled={products.length === 0}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ekle
                    </Button>
                  </div>
                </div>

                {errors.items && (
                  <p className="text-sm text-red-500">{errors.items}</p>
                )}
              </CardContent>
            </Card>

            {/* Ürün Listesi */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Eklenen Ürünler ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ürün</TableHead>
                        <TableHead>Miktar</TableHead>
                        <TableHead>Birim Fiyat</TableHead>
                        <TableHead>Toplam</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.product?.type === ProductType.SOFTWARE ? 'Yazılım' : 'Donanım'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="font-mono">
                            {formatPrice(item.unitPrice, item.currency)}
                          </TableCell>
                          <TableCell className="font-mono font-medium">
                            {formatPrice(item.totalPrice, item.currency)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Notlar */}
            <Card>
              <CardHeader>
                <CardTitle>Ek Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="terms">Şartlar ve Koşullar</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Ödeme şartları, teslimat koşulları vb..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="İç notlar, özel durumlar vb..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Toplam Tutar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Toplam Tutar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Toplam (TL):</span>
                    <span className="font-mono font-bold">
                      {formatPrice(totalTL, Currency.TL)}
                    </span>
                  </div>
                  {totalUSD > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Toplam (USD):</span>
                      <span className="font-mono">
                        {formatPrice(totalUSD, Currency.USD)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Döviz Kuru:</span>
                      <span className="font-mono">{exchangeRate.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seçili Müşteri */}
            {formData.customerId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Seçili Müşteri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const customer = customers.find(c => c.id === formData.customerId)
                    return customer ? (
                      <div className="space-y-1">
                        <div className="font-medium">{customer.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.contactName}
                        </div>
                      </div>
                    ) : null
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Döviz Kuru */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Döviz Kuru</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>USD/TL:</span>
                  <span className="font-mono">{exchangeRate.toFixed(4)}</span>
                </div>
                <p className="text-muted-foreground">
                  Kur otomatik olarak güncellenir
                </p>
              </CardContent>
            </Card>

            {/* Data Status */}
            <Card>
              <CardHeader>
                <CardTitle>Veri Durumu</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Müşteriler:</span>
                  <span className={customers.length === 0 ? 'text-red-600' : 'text-green-600'}>
                    {customers.length} adet
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ürünler:</span>
                  <span className={products.length === 0 ? 'text-red-600' : 'text-green-600'}>
                    {products.length} adet
                  </span>
                </div>
                {(customers.length === 0 || products.length === 0) && (
                  <p className="text-amber-600 text-xs">
                    Teklif oluşturmak için önce müşteri ve ürün eklemeniz gerekiyor.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/teklifler">İptal</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || customers.length === 0 || products.length === 0}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Teklifi Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}