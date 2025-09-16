'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Package,
  Upload,
  X,
  DollarSign,
  Save
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
import { Badge } from '@/components/ui/badge'
import { Currency, ProductType } from '@/lib/types'

// Labels for ProductType enum
const ProductTypeLabels = {
  [ProductType.SOFTWARE]: 'Yazılım',
  [ProductType.HARDWARE]: 'Donanım'
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  purchasePrice?: number | null
  currency: Currency
  type: ProductType
  sku: string | null
  photoUrl?: string | null
  isActive: boolean
}

interface UpdateProductData {
  name: string
  description: string
  price: number
  purchasePrice?: number
  currency: Currency
  type: ProductType
  sku: string
  isActive: boolean
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState<UpdateProductData>({
    name: '',
    description: '',
    price: 0,
    purchasePrice: 0,
    currency: Currency.TL,
    type: ProductType.SOFTWARE,
    sku: '',
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch existing product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoadingData(true)
        const response = await fetch(`/api/products/${productId}`)
        
        if (!response.ok) {
          throw new Error('Ürün bilgileri alınamadı')
        }
        
        const data = await response.json()
        const product: Product = data.product
        
        setFormData({
          name: product.name,
          description: product.description || '',
          price: Number(product.price),
          purchasePrice: product.purchasePrice ? Number(product.purchasePrice) : 0,
          currency: product.currency,
          type: product.type,
          sku: product.sku || '',
          isActive: product.isActive
        })
        
        if (product.photoUrl) {
          setCurrentPhotoUrl(product.photoUrl)
        }
      } catch (error) {
        console.error('Ürün yüklenemedi:', error)
        alert('Ürün bilgileri yüklenemedi')
        router.push('/urunler')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, router])

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

  const handleRemoveCurrentPhoto = () => {
    setCurrentPhotoUrl(null)
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
      submitData.append('type', formData.type)
      submitData.append('sku', formData.sku?.trim() || '')
      submitData.append('isActive', (formData.isActive ?? true).toString())
      
      if (selectedFile) {
        submitData.append('photo', selectedFile)
      }
      
      // Mevcut fotoğrafın silinip silinmeyeceğini belirt
      if (!currentPhotoUrl && !selectedFile) {
        submitData.append('removePhoto', 'true')
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: submitData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ürün güncellenemedi')
      }

      const result = await response.json()
      console.log('Ürün başarıyla güncellendi:', result)
      
      // Başarılı olursa ürün detay sayfasına yönlendir
      router.push(`/urunler/${productId}`)
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error)
      alert(error instanceof Error ? error.message : 'Ürün güncellenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateProductData, value: string | number | boolean | Currency | ProductType) => {
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

  // Kar marjı hesaplama
  const profitMargin = formData.purchasePrice && formData.purchasePrice > 0 
    ? ((formData.price - formData.purchasePrice) / formData.purchasePrice * 100)
    : 0

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/urunler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ürün Düzenle</h1>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/urunler/${productId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ürün Düzenle</h1>
          <p className="text-muted-foreground">
            {formData.name} bilgilerini güncelleyin
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
                  Ürün bilgilerini güncelleyin
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
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Ürün Açıklaması</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Ürün hakkında detaylı açıklama..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Bu açıklama tekliflerde ve faturaralarda görünecektir
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Ürün Türü *</Label>
                    <Select value={formData.type} onValueChange={(value: ProductType) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ürün türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ProductTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Stok Kodu)</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Örn: MAPOS-2024"
                      className={errors.sku ? 'border-red-500' : ''}
                    />
                    {errors.sku && (
                      <p className="text-sm text-red-600">{errors.sku}</p>
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
                    <Select value={formData.currency} onValueChange={(value: Currency) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Para birimi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Currency.TL}>₺ Türk Lirası</SelectItem>
                        <SelectItem value={Currency.USD}>$ ABD Doları</SelectItem>
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
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Alış Fiyatı</Label>
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
                      <p className="text-sm text-red-600">{errors.purchasePrice}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Bu fiyat sadece maliyet hesapları için kullanılır
                    </p>
                  </div>
                </div>

                {formData.purchasePrice && formData.purchasePrice > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Kar Marjı:</span>
                      <Badge variant={profitMargin > 30 ? 'default' : profitMargin > 10 ? 'secondary' : 'destructive'}>
                        %{profitMargin.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span>Kar Miktarı:</span>
                      <span className="font-mono">
                        {formData.currency === Currency.TL ? '₺' : '$'}{(formData.price - formData.purchasePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ürün Fotoğrafı */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Ürün Fotoğrafı</span>
                </CardTitle>
                <CardDescription>
                  Ürün fotoğrafını ekleyin veya güncelleyin (isteğe bağlı)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mevcut Fotoğraf */}
                {currentPhotoUrl && (
                  <div className="space-y-2">
                    <Label>Mevcut Fotoğraf</Label>
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                      <Image 
                        src={currentPhotoUrl} 
                        alt="Mevcut ürün fotoğrafı"
                        width={128}
                        height={128}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveCurrentPhoto}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Yeni Fotoğraf Yükleme */}
                <div className="space-y-2">
                  <Label>Yeni Fotoğraf Yükle</Label>
                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 w-32 flex-col"
                    >
                      <Upload className="h-6 w-6 mb-2" />
                      <span className="text-sm">Fotoğraf Seç</span>
                    </Button>
                    
                    {previewUrl && (
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                        <Image 
                          src={previewUrl} 
                          alt="Önizleme"
                          width={128}
                          height={128}
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {errors.photo && (
                  <p className="text-sm text-red-600">{errors.photo}</p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Desteklenen formatlar: JPG, PNG, WebP. Maksimum boyut: 5MB
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Durum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Aktif Durum</Label>
                  <Select value={formData.isActive.toString()} onValueChange={(value) => handleInputChange('isActive', value === 'true')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Aktif</SelectItem>
                      <SelectItem value="false">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>
                    {formData.isActive 
                      ? 'Ürün tekliflerde görünür ve satışa hazır' 
                      : 'Ürün tekliflerde görünmez ve satışa kapalı'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Özet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Ürün:</span>
                    <br />
                    <span>{formData.name || 'Belirtilmemiş'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Tür:</span>
                    <br />
                    <span>{ProductTypeLabels[formData.type]}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Fiyat:</span>
                    <br />
                    <span className="font-mono">
                      {formData.currency === Currency.TL ? '₺' : '$'}{formData.price.toFixed(2)}
                    </span>
                  </div>
                  {formData.purchasePrice && formData.purchasePrice > 0 && (
                    <div>
                      <span className="font-medium text-muted-foreground">Alış:</span>
                      <br />
                      <span className="font-mono">
                        {formData.currency === Currency.TL ? '₺' : '$'}{formData.purchasePrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-muted-foreground">Durum:</span>
                    <br />
                    <Badge variant={formData.isActive ? 'default' : 'secondary'}>
                      {formData.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bilgilendirme</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• * ile işaretli alanlar zorunludur</li>
                  <li>• Alış fiyatı sadece maliyet hesapları için kullanılır</li>
                  <li>• Fotoğraf tekliflerde gösterilir</li>
                  <li>• SKU benzersiz olmalıdır</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href={`/urunler/${productId}`}>İptal</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                Güncelleniyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}