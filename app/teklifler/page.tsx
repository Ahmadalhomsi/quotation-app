/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit,
  Eye,
  Download,
  Calendar,
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
import { formatPrice, calculateTotal } from '@/lib/format'
import { downloadQuotationPdf } from '@/lib/pdf-generator'

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch quotations from API
  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/quotations')
      const data = await response.json()
      
      if (response.ok) {
        setQuotations(data.quotations || [])
      } else {
        console.error('Teklifler alınamadı:', data.error)
        setQuotations([])
      }
    } catch (error) {
      console.error('API hatası:', error)
      setQuotations([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (quotationId: string, newStatus: QuotationStatus) => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Update the local state
        setQuotations(prevQuotations =>
          prevQuotations.map(quotation =>
            quotation.id === quotationId
              ? { ...quotation, status: newStatus }
              : quotation
          )
        )
      } else {
        const errorData = await response.json()
        console.error('Durum güncellenemedi:', errorData.error)
        alert('Durum güncellenemedi: ' + errorData.error)
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error)
      alert('Durum güncellenirken bir hata oluştu')
    }
  }

  const handleDownloadPdf = async (quotation: any) => {
    try {
      await downloadQuotationPdf({
        quotation: quotation,
        companyInfo: {
          name: 'MAPOS',
          address: 'İstanbul, Türkiye',
          phone: '+90 212 000 00 00',
          email: 'info@mapos.com',
          website: 'www.mapos.com'
        },
        exchangeRate: quotation.exchangeRate || 40.0
      })
    } catch (error) {
      console.error('PDF indirme hatası:', error)
      alert('PDF indirilemedi. Lütfen tekrar deneyin.')
    }
  }

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quotation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quotation.customer?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teklif Yönetimi</h1>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Teklif</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
            <p className="text-xs text-muted-foreground">
              Tüm zamanlar
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gönderilen Teklifler</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.filter((q: any) => q.status === QuotationStatus.SENT).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Yanıt beklenilen
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(calculateTotal(quotations, 'totalTL'), 'TL')}
            </div>
            <p className="text-xs text-muted-foreground">
              Türk Lirası cinsinden
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Teklif ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value={QuotationStatus.DRAFT}>Taslak</SelectItem>
            <SelectItem value={QuotationStatus.SENT}>Gönderildi</SelectItem>
            <SelectItem value={QuotationStatus.ACCEPTED}>Kabul Edildi</SelectItem>
            <SelectItem value={QuotationStatus.REJECTED}>Reddedildi</SelectItem>
            <SelectItem value={QuotationStatus.EXPIRED}>Süresi Doldu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teklif Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Teklifler</CardTitle>
          <CardDescription>
            {filteredQuotations.length} teklif bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quotations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz teklif bulunmuyor</h3>
              <p className="text-muted-foreground mb-4">
                İlk teklifinizi oluşturmak için başlayın.
              </p>
              <Button asChild>
                <Link href="/teklifler/yeni">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Teklif Oluştur
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
                  <TableHead>Toplam (TL)</TableHead>
                  <TableHead>Toplam (USD)</TableHead>
                  <TableHead>Geçerlilik</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation: any) => (
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
                        <div className="font-medium">{quotation.customer?.companyName}</div>
                        <div className="text-sm text-muted-foreground">
                          {quotation.customer?.contactName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={quotation.status} 
                        onValueChange={(value: QuotationStatus) => handleStatusUpdate(quotation.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(QuotationStatus).map((statusValue) => (
                            <SelectItem key={statusValue} value={statusValue}>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                statusValue === QuotationStatus.DRAFT ? 'bg-gray-100 text-gray-800' :
                                statusValue === QuotationStatus.SENT ? 'bg-blue-100 text-blue-800' :
                                statusValue === QuotationStatus.ACCEPTED ? 'bg-green-100 text-green-800' :
                                statusValue === QuotationStatus.REJECTED ? 'bg-red-100 text-red-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {QuotationStatusLabels[statusValue]}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-mono">
                      {quotation.totalTL ? formatPrice(quotation.totalTL, 'TL') : '-'}
                    </TableCell>
                    <TableCell className="font-mono">
                      {quotation.totalUSD ? formatPrice(quotation.totalUSD, 'USD') : '-'}
                    </TableCell>
                    <TableCell>
                      {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPdf(quotation)}
                          title="PDF İndir"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Görüntüle"
                        >
                          <Link href={`/teklifler/${quotation.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title="Düzenle"
                        >
                          <Link href={`/teklifler/${quotation.id}/duzenle`}>
                            <Edit className="h-4 w-4" />
                          </Link>
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