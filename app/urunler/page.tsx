'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Package, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye
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
import { Currency, ProductType, ProductTypeLabels, CurrencyLabels } from '@/lib/types'

// Mock data - bu gerçek uygulamada API'den gelecek
const mockProducts = [
  {
    id: '1',
    name: 'MAPOS Pro POS Yazılımı',
    description: 'Kapsamlı satış noktası yazılımı',
    price: 2500,
    currency: Currency.TL,
    type: ProductType.SOFTWARE,
    sku: 'MAPOS-PRO-001',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Touch Screen Monitor 15"',
    description: '15 inç dokunmatik ekran',
    price: 299,
    currency: Currency.USD,
    type: ProductType.HARDWARE,
    sku: 'TOUCH-15-001',
    isActive: true,
    createdAt: new Date('2024-01-10')
  }
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')

  const formatPrice = (price: number, currency: Currency) => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    const formattedPrice = formatter.format(price)
    return currency === Currency.TL ? `${formattedPrice} ₺` : `$${formattedPrice}`
  }

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || product.type === typeFilter
    const matchesCurrency = currencyFilter === 'all' || product.currency === currencyFilter
    
    return matchesSearch && matchesType && matchesCurrency
  })

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h1>
          <p className="text-muted-foreground">
            Katalog ürünlerinizi görüntüleyin ve yönetin
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
          <CardTitle className="text-lg">Filtreler</CardTitle>
          <CardDescription>Ürünleri arayın ve filtreleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ürün adı, açıklama veya SKU ile arayın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ürün Tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  <SelectItem value={ProductType.SOFTWARE}>
                    {ProductTypeLabels[ProductType.SOFTWARE]}
                  </SelectItem>
                  <SelectItem value={ProductType.HARDWARE}>
                    {ProductTypeLabels[ProductType.HARDWARE]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Para Birimi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Para Birimleri</SelectItem>
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
              <h3 className="text-lg font-medium mb-2">Ürün bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== 'all' || currencyFilter !== 'all'
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Henüz ürün eklenmemiş'}
              </p>
              <Button asChild>
                <Link href="/urunler/yeni">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Ürünü Ekle
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-muted-foreground">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.type === ProductType.SOFTWARE
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ProductTypeLabels[product.type]}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatPrice(product.price, product.currency)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.sku || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
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
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}