/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  Building,
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
import { QuotationStatus, QuotationStatusLabels } from '@/lib/types'
import { downloadQuotationPdf } from '@/lib/pdf-generator'

// Mock data - bu gerçek uygulamada API'den gelecek
const mockQuotations = [
  {
    id: '1',
    quotationNumber: 'TKL-2024-001',
    title: 'POS Sistemi Teklifi',
    description: 'Kapsamlı POS sistemi çözümü',
    customer: {
      id: '1',
      companyName: 'ABC Teknoloji A.Ş.',
      contactName: 'Ahmet Yılmaz',
      email: 'ahmet@abcteknoloji.com',
      phone: '+90 212 123 45 67'
    },
    status: QuotationStatus.SENT,
    totalTL: 15750.00,
    totalUSD: 525.00,
    validUntil: new Date('2024-02-15'),
    createdAt: new Date('2024-01-15'),
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'MAPOS Pro POS Yazılımı',
        productType: 'SOFTWARE',
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500,
        currency: 'TL'
      },
      {
        id: '2',
        productId: '2',
        productName: 'Touch Screen Monitor 15"',
        productType: 'HARDWARE',
        quantity: 2,
        unitPrice: 299,
        totalPrice: 598,
        currency: 'USD'
      }
    ],
    terms: 'Ödeme şartları: 30 gün vadeli',
    notes: 'Kurulum desteği dahildir'
  },
  {
    id: '2',
    quotationNumber: 'TKL-2024-002',
    title: 'Donanım Güncelleme Teklifi',
    description: 'Mevcut sistemlerin güncellenmesi',
    customer: {
      id: '2',
      companyName: 'XYZ Perakende Ltd.',
      contactName: 'Ayşe Demir',
      email: 'ayse@xyzperakende.com',
      phone: '+90 312 987 65 43'
    },
    status: QuotationStatus.DRAFT,
    totalTL: 8900.00,
    totalUSD: 296.67,
    validUntil: new Date('2024-02-20'),
    createdAt: new Date('2024-01-18'),
    items: [
      {
        id: '3',
        productId: '2',
        productName: 'Touch Screen Monitor 15"',
        productType: 'HARDWARE',
        quantity: 3,
        unitPrice: 299,
        totalPrice: 897,
        currency: 'USD'
      }
    ],
    terms: 'Ödeme şartları: Peşin ödeme',
    notes: 'Hızlı teslimat gerekli'
  }
]

export default function QuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const formatPrice = (price: number, currency: 'TL' | 'USD') => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    const formattedPrice = formatter.format(price)
    return currency === 'TL' ? `${formattedPrice} ₺` : `$${formattedPrice}`
  }

  const handleDownloadPdf = async (quotation: typeof mockQuotations[0]) => {
    try {
      await downloadQuotationPdf({
        quotation: quotation as any,
        companyInfo: {
          name: 'MAPOS',
          address: 'İstanbul, Türkiye',
          phone: '+90 212 000 00 00',
          email: 'info@mapos.com',
          website: 'www.mapos.com'
        },
        exchangeRate: 30.5
      })
    } catch (error) {
      console.error('PDF indirme hatası:', error)
      alert('PDF indirilemedi. Lütfen tekrar deneyin.')
    }
  }

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.DRAFT:
        return 'bg-gray-100 text-gray-800'
      case QuotationStatus.SENT:
        return 'bg-blue-100 text-blue-800'
      case QuotationStatus.ACCEPTED:
        return 'bg-green-100 text-green-800'
      case QuotationStatus.REJECTED:
        return 'bg-red-100 text-red-800'
      case QuotationStatus.EXPIRED:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredQuotations = mockQuotations.filter(quotation => {
    const matchesSearch = quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teklif Yönetimi</h1>
          <p className="text-muted-foreground">
            Müşteri tekliflerinizi görüntüleyin ve yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/teklifler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Teklif
          </Link>
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Teklifler
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockQuotations.length}</div>
            <p className="text-xs text-muted-foreground">
              Oluşturulan teklif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bekleyen Teklifler
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockQuotations.filter(q => q.status === QuotationStatus.SENT).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Müşteri yanıtı beklenen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bu Ay Toplam
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(mockQuotations.reduce((sum, q) => sum + (q.totalTL || 0), 0), 'TL')}
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam teklif tutarı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kabul Oranı
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Kabul edilen teklifler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
          <CardDescription>Teklifleri arayın ve filtreleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Teklif numarası, başlık veya müşteri adı ile arayın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {Object.values(QuotationStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {QuotationStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teklif Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Teklifler ({filteredQuotations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Teklif bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Henüz teklif oluşturulmamış'}
              </p>
              <Button asChild>
                <Link href="/teklifler/yeni">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Teklifi Oluştur
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teklif No / Başlık</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Toplam Tutar</TableHead>
                  <TableHead>Geçerlilik</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quotation.quotationNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {quotation.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quotation.customer.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {quotation.customer.contactName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {QuotationStatusLabels[quotation.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        <div>{formatPrice(quotation.totalTL || 0, 'TL')}</div>
                        <div className="text-muted-foreground">
                          {formatPrice(quotation.totalUSD || 0, 'USD')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {quotation.validUntil.toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-muted-foreground">
                        {quotation.validUntil < new Date() ? (
                          <span className="text-red-600">Süresi doldu</span>
                        ) : (
                          `${Math.ceil((quotation.validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı`
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/teklifler/${quotation.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadPdf(quotation)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/teklifler/${quotation.id}/duzenle`}>
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