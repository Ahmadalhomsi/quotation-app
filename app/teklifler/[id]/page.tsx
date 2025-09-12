'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Download,
  FileText,
  Building,
  DollarSign,
  Package,
  Eye,
  Trash2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { QuotationStatus, QuotationStatusLabels, ProductType } from '@/lib/types'

// Simplified types for mock data
interface QuotationDetailCustomer {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  taxNumber: string
  taxOffice: string
}

interface QuotationDetailItem {
  id: string
  productId: string
  productName: string
  productType: ProductType
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: string
}

interface QuotationDetail {
  id: string
  quotationNumber: string
  title: string
  description: string
  customerId: string
  customer: QuotationDetailCustomer
  status: QuotationStatus
  totalTL: number
  totalUSD: number
  exchangeRate: number
  validUntil: Date
  createdAt: Date
  updatedAt: Date
  items: QuotationDetailItem[]
  terms: string
  notes: string
}

// Mock data - same as in the listing page
const mockQuotations = [
  {
    id: '1',
    quotationNumber: 'TKL-2024-001',
    title: 'POS Sistemi Teklifi',
    description: 'Kapsamlı POS sistemi çözümü',
    customerId: '1',
    customer: {
      id: '1',
      companyName: 'ABC Teknoloji A.Ş.',
      contactName: 'Ahmet Yılmaz',
      email: 'ahmet@abcteknoloji.com',
      phone: '+90 212 123 45 67',
      address: 'Maslak Mahallesi, Büyükdere Cad. No: 123, Şişli/İstanbul',
      taxNumber: '1234567890',
      taxOffice: 'Maslak V.D.'
    },
    status: QuotationStatus.SENT,
    totalTL: 15750.00,
    totalUSD: 525.00,
    exchangeRate: 30.0,
    validUntil: new Date('2024-02-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'MAPOS Pro POS Yazılımı',
        productType: ProductType.SOFTWARE,
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500,
        currency: 'TL'
      },
      {
        id: '2',
        productId: '2',
        productName: 'Touch Screen Monitor 15"',
        productType: ProductType.HARDWARE,
        quantity: 2,
        unitPrice: 299,
        totalPrice: 598,
        currency: 'USD'
      }
    ],
    terms: 'Ödeme şartları: 30 gün vadeli\nTeslimat: 15 iş günü\nGaranti: 2 yıl',
    notes: 'Kurulum desteği dahildir\nEğitim hizmeti ücretsizdir'
  },
  {
    id: '2',
    quotationNumber: 'TKL-2024-002',
    title: 'Donanım Güncelleme Teklifi',
    description: 'Mevcut sistemlerin güncellenmesi',
    customerId: '2',
    customer: {
      id: '2',
      companyName: 'XYZ Perakende Ltd.',
      contactName: 'Ayşe Demir',
      email: 'ayse@xyzperakende.com',
      phone: '+90 312 987 65 43',
      address: 'Çankaya Mahallesi, Atatürk Bulvarı No: 456, Çankaya/Ankara',
      taxNumber: '0987654321',
      taxOffice: 'Çankaya V.D.'
    },
    status: QuotationStatus.DRAFT,
    totalTL: 8900.00,
    totalUSD: 296.67,
    exchangeRate: 30.0,
    validUntil: new Date('2024-02-20'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    items: [
      {
        id: '3',
        productId: '2',
        productName: 'Touch Screen Monitor 15"',
        productType: ProductType.HARDWARE,
        quantity: 3,
        unitPrice: 299,
        totalPrice: 897,
        currency: 'USD'
      }
    ],
    terms: 'Ödeme şartları: Peşin ödeme\nTeslimat: 5 iş günü',
    notes: 'Hızlı teslimat gerekli'
  }
]

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchQuotation = async () => {
      try {
        const found = mockQuotations.find(q => q.id === params.id)
        setQuotation(found || null)
      } catch (error) {
        console.error('Teklif bulunamadı:', error)
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

  const handleDownloadPdf = async () => {
    if (!quotation) return
    
    try {
      // TODO: Implement actual PDF download with proper types
      alert('PDF indirme özelliği aktif edildi. Bu özellik yakında gelecek.')
    } catch (error) {
      console.error('PDF indirme hatası:', error)
      alert('PDF indirilemedi. Lütfen tekrar deneyin.')
    }
  }

  const handleDelete = () => {
    if (confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
      // TODO: API call to delete
      router.push('/teklifler')
    }
  }

  if (isLoading) {
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
            <h1 className="text-3xl font-bold tracking-tight">Teklif Detayları</h1>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!quotation) {
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
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Teklif Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">
              Aradığınız teklif mevcut değil.
            </p>
            <Button asChild>
              <Link href="/teklifler">
                Tekliflere Dön
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teklifler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {quotation.quotationNumber}
            </h1>
            <p className="text-muted-foreground">{quotation.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            PDF İndir
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/teklifler/${quotation.id}/duzenle`}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Link>
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-800">
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quotation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Teklif Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Teklif Numarası
                  </label>
                  <p className="font-mono">{quotation.quotationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Durum
                  </label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(quotation.status)}>
                      {QuotationStatusLabels[quotation.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Oluşturma Tarihi
                  </label>
                  <p>{quotation.createdAt.toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Geçerlilik Tarihi
                  </label>
                  <p className={quotation.validUntil < new Date() ? 'text-red-600' : ''}>
                    {quotation.validUntil.toLocaleDateString('tr-TR')}
                    {quotation.validUntil < new Date() && ' (Süresi doldu)'}
                  </p>
                </div>
              </div>
              {quotation.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Açıklama
                  </label>
                  <p className="mt-1">{quotation.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Müşteri Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Şirket Adı
                  </label>
                  <p className="font-medium">{quotation.customer.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    İletişim Kişisi
                  </label>
                  <p>{quotation.customer.contactName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    E-posta
                  </label>
                  <p>{quotation.customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Telefon
                  </label>
                  <p>{quotation.customer.phone}</p>
                </div>
              </div>
              {quotation.customer.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Adres
                  </label>
                  <p className="mt-1">{quotation.customer.address}</p>
                </div>
              )}
              {quotation.customer.taxNumber && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Vergi Numarası
                    </label>
                    <p className="font-mono">{quotation.customer.taxNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Vergi Dairesi
                    </label>
                    <p>{quotation.customer.taxOffice}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Ürünler ({quotation.items.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Birim Fiyat</TableHead>
                    <TableHead>P.B.</TableHead>
                    <TableHead className="text-right">Toplam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.productType === ProductType.SOFTWARE ? 'Yazılım' : 'Donanım'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-mono">
                        {formatPrice(item.unitPrice, item.currency as 'TL' | 'USD')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.currency}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatPrice(item.totalPrice, item.currency as 'TL' | 'USD')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Terms and Notes */}
          {(quotation.terms || quotation.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Ek Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotation.terms && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Şartlar ve Koşullar
                    </label>
                    <p className="mt-1 whitespace-pre-line">{quotation.terms}</p>
                  </div>
                )}
                {quotation.notes && (
                  <>
                    {quotation.terms && <Separator />}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Notlar
                      </label>
                      <p className="mt-1 whitespace-pre-line">{quotation.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Toplam Tutar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Toplam (TL):</span>
                  <span className="font-mono font-bold text-lg">
                    {formatPrice(quotation.totalTL || 0, 'TL')}
                  </span>
                </div>
                {(quotation.totalUSD || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Toplam (USD):</span>
                    <span className="font-mono text-lg">
                      {formatPrice(quotation.totalUSD || 0, 'USD')}
                    </span>
                  </div>
                )}
                {quotation.exchangeRate && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Döviz Kuru:</span>
                      <span className="font-mono">{quotation.exchangeRate.toFixed(4)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleDownloadPdf} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                PDF İndir
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/teklifler/${quotation.id}/duzenle`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Düzenle
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Önizleme
              </Button>
            </CardContent>
          </Card>

          {/* Status Info */}
          <Card>
            <CardHeader>
              <CardTitle>Durum Bilgisi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mevcut Durum:</span>
                <Badge className={getStatusColor(quotation.status)}>
                  {QuotationStatusLabels[quotation.status]}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {quotation.status === QuotationStatus.DRAFT && (
                  <p>Teklif henüz taslak halinde. Düzenleyip gönderilebilir.</p>
                )}
                {quotation.status === QuotationStatus.SENT && (
                  <p>Teklif müşteriye gönderildi. Yanıt bekleniyor.</p>
                )}
                {quotation.status === QuotationStatus.ACCEPTED && (
                  <p>Teklif müşteri tarafından kabul edildi.</p>
                )}
                {quotation.status === QuotationStatus.REJECTED && (
                  <p>Teklif müşteri tarafından reddedildi.</p>
                )}
                {quotation.status === QuotationStatus.EXPIRED && (
                  <p>Teklifin geçerlilik süresi doldu.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}