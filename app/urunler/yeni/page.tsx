'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Package } from 'lucide-react'

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
  Currency, 
  ProductType, 
  ProductTypeLabels, 
  CurrencyLabels,
  CreateProductData 
} from '@/lib/types'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    currency: Currency.TL,
    type: ProductType.SOFTWARE,
    sku: '',
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gereklidir'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Fiyat 0\'dan büyük olmalıdır'
    }

    if (formData.sku && !/^[A-Za-z0-9-_]+$/.test(formData.sku)) {
      newErrors.sku = 'SKU sadece harf, rakam, tire ve alt çizgi içerebilir'
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
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ürün oluşturulamadı')
      }

      const result = await response.json()
      console.log('Ürün başarıyla oluşturuldu:', result)
      
      // Başarılı olursa ürünler sayfasına yönlendir
      router.push('/urunler')
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error)
      alert(error instanceof Error ? error.message : 'Ürün oluşturulurken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateProductData, value: string | number | boolean | Currency | ProductType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/urunler">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yeni Ürün Ekle</h1>
          <p className="text-muted-foreground">
            Katalog için yeni ürün oluşturun
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ana Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Ürün Bilgileri</span>
                </CardTitle>
                <CardDescription>
                  Temel ürün bilgilerini girin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Örn: MAPOS Pro POS Yazılımı"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Ürün hakkında detaylı açıklama..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Stok Kodu)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                    placeholder="Örn: MAPOS-PRO-001"
                    className={errors.sku ? 'border-red-500' : ''}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    İsteğe bağlı. Sadece harf, rakam, tire ve alt çizgi kullanın.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fiyat ve Kategori</CardTitle>
                <CardDescription>
                  Ürün fiyatı ve kategori bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Fiyat *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Para Birimi *</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => handleInputChange('currency', value as Currency)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Currency.TL}>
                          {CurrencyLabels[Currency.TL]}
                        </SelectItem>
                        <SelectItem value={Currency.USD}>
                          {CurrencyLabels[Currency.USD]}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Ürün Tipi *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value as ProductType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductType.SOFTWARE}>
                        {ProductTypeLabels[ProductType.SOFTWARE]}
                      </SelectItem>
                      <SelectItem value={ProductType.HARDWARE}>
                        {ProductTypeLabels[ProductType.HARDWARE]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Durum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="isActive">Ürün aktif</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aktif ürünler teklif oluştururken seçilebilir
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Özet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fiyat:</span>
                  <span className="font-mono">
                    {formData.price > 0 
                      ? `${formData.price.toFixed(2)} ${formData.currency === Currency.TL ? '₺' : '$'}`
                      : '-'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tip:</span>
                  <span>{ProductTypeLabels[formData.type]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durum:</span>
                  <span className={formData.isActive ? 'text-green-600' : 'text-red-600'}>
                    {formData.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/urunler">İptal</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Ürünü Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}