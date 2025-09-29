'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Package, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Currency } from '@/lib/types'

// Types for API data
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

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        
        if (statusFilter !== 'all') {
          params.append('active', statusFilter === 'active' ? 'true' : 'false')
        }

        const response = await fetch(`/api/products?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Ürünler alınamadı')
        }
        
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error('Ürünler yüklenemedi:', error)
        setError(error instanceof Error ? error.message : 'Ürünler yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [statusFilter])

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower)
    )
  })

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`"${productName}" ürününü silmek istediğinizden emin misiniz?`)) return

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

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId))
      toast.success('Ürün başarıyla silindi')
    } catch (error) {
      console.error('Ürün silme hatası:', error)
      toast.error('Ürün silinirken bir hata oluştu')
    }
  }

  const formatPrice = (price: number, currency: Currency) => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    const formattedPrice = formatter.format(price)
    return currency === Currency.TL ? `₺${formattedPrice}` : `$${formattedPrice}`
  }

  // Calculate statistics
  const activeProducts = products.filter(p => p.isActive).length
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const productsThisMonth = products.filter(product => {
    const createdDate = new Date(product.createdAt)
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
  }).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h1>
            <p className="text-muted-foreground">Veriler yükleniyor...</p>
          </div>
          <Button asChild>
            <Link href="/urunler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ürün
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h1>
            <p className="text-red-600">{error}</p>
          </div>
          <Button asChild>
            <Link href="/urunler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ürün
            </Link>
          </Button>
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
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h1>
          <p className="text-muted-foreground">
            Ürünlerinizi görüntüleyin ve yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/urunler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Link>
        </Button>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ürün Arama ve Filtreleme</CardTitle>
          <CardDescription>Ürünlerinizi arayın ve filtreleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ürün adı, açıklama veya SKU ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </CardContent>
      </Card>

      {/* Ürün Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Ürünler ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {products.length === 0 ? 'Henüz ürün eklenmemiş' : 'Ürün bulunamadı'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Arama/filtre kriterlerinizi değiştirmeyi deneyin'
                  : 'Veritabanında ürün bulunamadı. İlk ürününüzü ekleyin.'}
              </p>
              <Button asChild>
                <Link href="/urunler/yeni">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Ürünü Ekle
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="relative">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Ürün Bilgileri</TableHead>
                    <TableHead className="w-[120px]">Satış Fiyatı</TableHead>
                    <TableHead className="w-[120px]">Alış Fiyatı</TableHead>
                    <TableHead className="w-[100px]">SKU</TableHead>
                    <TableHead className="w-[80px]">Durum</TableHead>
                    <TableHead className="w-[100px]">Kayıt Tarihi</TableHead>
                    <TableHead className="w-[120px] text-right sticky right-0 bg-background/95 backdrop-blur shadow-lg border-l">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="max-w-[300px]">
                      <div className="flex items-center space-x-3">
                        {product.photoUrl && (
                          <div className="w-10 h-10 border rounded overflow-hidden bg-muted flex-shrink-0">
                            <Image 
                              src={product.photoUrl} 
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="font-medium truncate">{product.name}</div>
                          {product.description && (
                            <div 
                              className="text-sm text-muted-foreground line-clamp-2 break-words"
                              title={product.description}
                            >
                              {product.description.length > 80 
                                ? `${product.description.substring(0, 80)}...` 
                                : product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatPrice(Number(product.price), product.currency)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {product.purchasePrice 
                        ? formatPrice(Number(product.purchasePrice), product.currency)
                        : 'Belirtilmemiş'
                      }
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="truncate max-w-[100px]" title={product.sku || 'Yok'}>
                        {product.sku || 'Yok'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right sticky right-0 bg-background/95 backdrop-blur border-l shadow-lg">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/urunler/${product.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/urunler/${product.id}/duzenle`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Ürün
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Katalogda kayıtlı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Ürün
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Satışa hazır
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bu Ay Eklenen
            </CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Yeni ürün
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}