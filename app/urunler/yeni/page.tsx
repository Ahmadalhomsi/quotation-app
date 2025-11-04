'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Package, DollarSign, Upload, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

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
import { Currency, CreateProductData, CurrencyLabels } from '@/lib/types'

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateProductData & { photo?: File }>({
    name: '',
    description: '',
    price: 0,
    purchasePrice: 0,
    currency: Currency.TL,
    sku: '',
    isActive: true,
    kdvRate: 20
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Zorunlu alanlar
    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gereklidir'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Ürün adı en az 2 karakter olmalıdır'
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Satış fiyatı 0\'dan büyük olmalıdır'
    }

    if (formData.purchasePrice && formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Alış fiyatı 0\'dan küçük olamaz'
    }

    // SKU benzersizlik kontrolü (API tarafında da kontrol edilecek)
    if (formData.sku && formData.sku.trim().length < 2) {
      newErrors.sku = 'SKU en az 2 karakter olmalıdır'
    }

    // Dosya boyutu kontrolü
    if (selectedFile) {
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (selectedFile.size > maxSize) {
        newErrors.photo = 'Fotoğraf boyutu 5MB\'dan küçük olmalıdır'
      }

      // Dosya tipi kontrolü
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(selectedFile.type)) {
        newErrors.photo = 'Sadece JPG, PNG ve WebP formatları desteklenir'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Önizleme oluştur
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Hata varsa temizle
      if (errors.photo) {
        setErrors(prev => ({ ...prev, photo: '' }))
      }
    }
  }

  const handleRemovePhoto = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // FormData kullanarak dosya ile birlikte gönder
      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('description', formData.description?.trim() || '')
      submitData.append('price', formData.price.toString())
      if (formData.purchasePrice) {
        submitData.append('purchasePrice', formData.purchasePrice.toString())
      }
      submitData.append('currency', formData.currency)
      submitData.append('sku', formData.sku?.trim() || '')
      submitData.append('isActive', (formData.isActive ?? true).toString())
      submitData.append('kdvRate', (formData.kdvRate ?? 20).toString())
      
      if (selectedFile) {
        submitData.append('photo', selectedFile)
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ürün oluşturulamadı')
      }

      const result = await response.json()
      console.log('Ürün başarıyla oluşturuldu:', result)
      
      toast.success('Ürün başarıyla oluşturuldu')
      // Başarılı olursa ürünler sayfasına yönlendir
      router.push('/urunler')
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error)
      toast.error(error instanceof Error ? error.message : 'Ürün oluşturulurken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateProductData, value: string | number | boolean | Currency) => {
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
            Yeni ürün kaydı oluşturun
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ana Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ürün Bilgileri */}
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
                    placeholder="Örn: MAPOS POS Sistemi"
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
                    placeholder="Ürün açıklaması..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU / Stok Kodu</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Örn: POS-001"
                      className={errors.sku ? 'border-red-500' : ''}
                    />
                    {errors.sku && (
                      <p className="text-sm text-red-500">{errors.sku}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fiyat Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Fiyat Bilgileri</span>
                </CardTitle>
                <CardDescription>
                  Satış ve alış fiyatlarını belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
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
                        {Object.entries(CurrencyLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Satış Fiyatı *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Alış Fiyatı (Maliyet)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.purchasePrice || ''}
                      onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={errors.purchasePrice ? 'border-red-500' : ''}
                    />
                    {errors.purchasePrice && (
                      <p className="text-sm text-red-500">{errors.purchasePrice}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Kâr marjı hesaplaması için kullanılır
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kdvRate">KDV Oranı (%) *</Label>
                  <Input
                    id="kdvRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.kdvRate || 20}
                    onChange={(e) => handleInputChange('kdvRate', parseFloat(e.target.value) || 20)}
                    placeholder="20.00"
                    className={errors.kdvRate ? 'border-red-500' : ''}
                  />
                  {errors.kdvRate && (
                    <p className="text-sm text-red-500">{errors.kdvRate}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Bu ürün için uygulanacak KDV oranı
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ürün Fotoğrafı */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Ürün Fotoğrafı</span>
                </CardTitle>
                <CardDescription>
                  Ürün fotoğrafı yükleyin (isteğe bağlı)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewUrl ? (
                  <div className="relative flex justify-center">
                    <div className="relative w-64 h-64 border rounded-lg overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Ürün önizlemesi"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemovePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Fotoğraf yüklemek için tıklayın
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WebP (max 5MB)
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {errors.photo && (
                  <p className="text-sm text-red-500">{errors.photo}</p>
                )}
                
                {!previewUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Fotoğraf Seç
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Özet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formData.name || 'Ürün adı girilmedi'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formData.price} {CurrencyLabels[formData.currency]}
                    </span>
                  </div>
                  
                  {formData.purchasePrice && formData.purchasePrice > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">Alış:</span>
                      <span className="text-sm">
                        {formData.purchasePrice} {CurrencyLabels[formData.currency]}
                      </span>
                    </div>
                  )}
                  
                  {formData.sku && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">SKU:</span>
                      <span className="text-sm">{formData.sku}</span>
                    </div>
                  )}

                  {formData.price > 0 && formData.purchasePrice && formData.purchasePrice > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Kâr Marjı:</span>
                        <span className="text-sm font-medium text-green-600">
                          %{(((formData.price - formData.purchasePrice) / formData.price) * 100).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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
                <CardTitle className="text-lg">Bilgilendirme</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• Ürün adı ve satış fiyatı zorunludur</li>
                  <li>• Alış fiyatı kâr marjı hesaplaması için kullanılır</li>
                  <li>• SKU benzersiz olmalıdır</li>
                  <li>• Fotoğraf PDF tekliflerinde görünecektir</li>
                  <li>• Tüm bilgiler daha sonra düzenlenebilir</li>
                </ul>
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