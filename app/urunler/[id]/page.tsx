'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  EyeOff,
  Calendar,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Currency } from '@/lib/types'



interface Product {
  id: string
  name: string
  description: string | null
  price: number
  purchasePrice?: number | null
  currency: Currency
  sku: string | null
  photoUrl?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/products/${productId}`)
        
        if (!response.ok) {
          throw new Error('Ürün bilgileri alınamadı')
        }
        
        const data = await response.json()
        setProduct(data.product)
      } catch (error) {
        console.error('Ürün yüklenemedi:', error)
        setError(error instanceof Error ? error.message : 'Ürün yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleDelete = async () => {
    if (!product) return
    
    if (!confirm(`"${product.name}" ürününü silmek istediğinizden emin misiniz?`)) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.status === 409) {
        toast.error('Bu ürüne ait teklifler bulunduğu için silinemez')
        return
      }

      if (response.status === 404) {
        toast.error('Ürün bulunamadı')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Ürün silinemedi')
      }

      toast.success('Ürün başarıyla silindi')
      // Redirect to products list
      window.location.href = '/urunler'
    } catch (error) {
      console.error('Ürün silme hatası:', error)
      toast.error('Ürün silinirken bir hata oluştu')
    }
  }

  const formatPrice = (amount: number, currency: Currency): string => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    const formattedAmount = formatter.format(amount)
    return currency === Currency.TL ? `₺${formattedAmount}` : `$${formattedAmount}`
  }

  // Kar marjı hesaplama
  const profitMargin = product?.purchasePrice && product.purchasePrice > 0 
    ? ((product.price - product.purchasePrice) / product.purchasePrice * 100)
    : 0

  if (isLoading) {
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
            <h1 className="text-3xl font-bold tracking-tight">Ürün Detayları</h1>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
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
            <h1 className="text-3xl font-bold tracking-tight">Ürün Detayları</h1>
            <p className="text-red-600">{error || 'Ürün bulunamadı'}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium mb-2">Ürün Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">{error || 'Bu ürün mevcut değil'}</p>
            <Button asChild>
              <Link href="/urunler">Ürünlere Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/urunler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">
              Ürün Detayları
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/urunler/${product.id}/duzenle`}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Photo and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Ürün Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                {/* Product Photo */}
                <div className="flex-shrink-0">
                  {product.photoUrl ? (
                    <div className="w-48 h-48 border rounded-lg overflow-hidden bg-muted">
                      <Image 
                        src={product.photoUrl} 
                        alt={product.name}
                        width={192}
                        height={192}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center bg-muted">
                      <div className="text-center text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Fotoğraf Yok</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{product.name}</h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? (
                          <>
                            <Eye className="mr-1 h-3 w-3" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-3 w-3" />
                            Pasif
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {product.description && (
                    <div>
                      <h3 className="font-medium mb-2">Açıklama</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {product.sku && (
                    <div>
                      <h3 className="font-medium mb-1">SKU</h3>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                        {product.sku}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Fiyat Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Satış Fiyatı</div>
                  <div className="text-2xl font-bold">
                    {formatPrice(Number(product.price), product.currency)}
                  </div>
                </div>
                
                {product.purchasePrice && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Alış Fiyatı</div>
                    <div className="text-2xl font-bold text-muted-foreground">
                      {formatPrice(Number(product.purchasePrice), product.currency)}
                    </div>
                  </div>
                )}
              </div>

              {product.purchasePrice && product.purchasePrice > 0 && (
                <>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Kar Miktarı</div>
                      <div className="text-lg font-bold">
                        {formatPrice(Number(product.price) - Number(product.purchasePrice), product.currency)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Kar Marjı</div>
                      <div className="text-lg font-bold">
                        <Badge variant={profitMargin > 30 ? 'default' : profitMargin > 10 ? 'secondary' : 'destructive'}>
                          %{profitMargin.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Para Birimi</div>
                      <div className="text-lg font-bold">
                        {product.currency === Currency.TL ? '₺ TL' : '$ USD'}
                      </div>
                    </div>
                  </div>
                </>
              )}
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
              <Badge variant={product.isActive ? 'default' : 'secondary'} className="mb-4">
                {product.isActive ? 'Aktif Ürün' : 'Pasif Ürün'}
              </Badge>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-muted-foreground">Kayıt Tarihi</div>
                    <div>{new Date(product.createdAt).toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-muted-foreground">Son Güncelleme</div>
                    <div>{new Date(product.updatedAt).toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
                {product.sku && (
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-muted-foreground">Stok Kodu</div>
                      <div className="font-mono">{product.sku}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href={`/teklifler/yeni?productId=${product.id}`}>
                  Teklife Ekle
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/urunler/${product.id}/duzenle`}>
                  Bilgileri Düzenle
                </Link>
              </Button>
              {product.isActive ? (
                <Button variant="outline" className="w-full" disabled>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Pasif Yap
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  <Eye className="mr-2 h-4 w-4" />
                  Aktif Yap
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tekliflerde Kullanım:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Satış Miktarı:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toplam Gelir:</span>
                <span className="font-medium">₺0.00</span>
              </div>
            </CardContent>
          </Card>

          {!product.isActive && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">Uyarı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  Bu ürün pasif durumda. Yeni tekliflerde görünmez ve satışa kapalı.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}