/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Edit,
  Eye,
  Download,
  Calendar,
  DollarSign,
  Trash2,
  Phone,
  Loader2
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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { QuotationStatus, QuotationStatusLabels } from '@/lib/types'
import { formatPrice } from '@/lib/format'
import { ReactPdfGenerator } from '@/lib/pdf-generator-react'

// Call tracking status (matching database values)
type CallStatus = 'arandı' | '1 daha ara' | 'takip et'

const CALL_STATUSES: CallStatus[] = ['arandı', '1 daha ara', 'takip et']

const CallStatusLabels: Record<CallStatus, string> = {
  'arandı': 'Arandı',
  '1 daha ara': '1 Daha Ara',
  'takip et': 'Takip Et'
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface QuotationStats {
  total: number
  sentCount: number
  totalTL: number
  totalUSD: number
}

const DEFAULT_PAGE_SIZE = 20

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1
  })
  const [stats, setStats] = useState<QuotationStats>({
    total: 0,
    sentCount: 0,
    totalTL: 0,
    totalUSD: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  // Track call status for each quotation (using local state for now)
  const [callStatuses, setCallStatuses] = useState<Record<string, CallStatus>>({})

  const fetchQuotations = useCallback(
    async (page: number, search: string, status: string) => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(DEFAULT_PAGE_SIZE)
        })
        if (search) params.set('search', search)
        if (status && status !== 'all') params.set('status', status)

        const response = await fetch(`/api/quotations?${params.toString()}`)
        const data = await response.json()

        if (response.ok) {
          setQuotations(data.quotations || [])
          if (data.pagination) {
            setPagination(data.pagination)
          }
          if (data.stats) {
            setStats(data.stats)
          }

          // Initialize call statuses from database
          const initialCallStatuses: Record<string, CallStatus> = {}
          data.quotations?.forEach((quotation: any) => {
            if (quotation.callStatus) {
              initialCallStatuses[quotation.id] = quotation.callStatus as CallStatus
            }
          })
          setCallStatuses(initialCallStatuses)
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
    },
    []
  )

  // Fetch quotations from API whenever the applied filter set changes
  useEffect(() => {
    fetchQuotations(currentPage, appliedSearch, statusFilter)
  }, [currentPage, appliedSearch, statusFilter, fetchQuotations])

  // If the user lands on a page that no longer has data (e.g. after deleting
  // items), bounce back to page 1 of the current filter.
  useEffect(() => {
    if (!isLoading && pagination.total > 0 && currentPage > pagination.totalPages) {
      setCurrentPage(1)
    }
  }, [isLoading, pagination.total, pagination.totalPages, currentPage])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setAppliedSearch(searchInput.trim())
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setAppliedSearch('')
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === currentPage) return
    setCurrentPage(page)
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
        // If a filter is applied, the SENT stat may need to be recomputed
        if (statusFilter === 'all' || statusFilter === QuotationStatus.SENT || statusFilter === newStatus) {
          // Re-fetch stats silently
          fetchQuotations(currentPage, appliedSearch, statusFilter)
        }
      } else {
        const errorData = await response.json()
        console.error('Durum güncellenemedi:', errorData.error)
        toast.error('Durum güncellenemedi: ' + errorData.error)
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error)
      toast.error('Durum güncellenirken bir hata oluştu')
    }
  }

  const handleDownloadPdf = async (quotation: any) => {
    try {
      await ReactPdfGenerator.downloadQuotationPdf({
        quotation: quotation,
        companyInfo: {
          name: 'MAPOS',
          address: 'Yeşilove Mah. 2602. Sk. No:3/A Küçükçekmece / İSTANBUL',
          phone: '+90 537 204 99 81',
          email: 'info@mapos.com.tr',
          website: 'mapos.com.tr'
        },
        exchangeRate: quotation.exchangeRate || 40.0
      })
    } catch (error) {
      console.error('PDF indirme hatası:', error)
      toast.error('PDF indirilemedi. Lütfen tekrar deneyin.')
    }
  }

  const handleCallStatusUpdate = async (quotationId: string, newCallStatus: CallStatus) => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}/call-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callStatus: newCallStatus }),
      })

      if (!response.ok) {
        throw new Error('Arama durumu güncellenemedi')
      }

      setCallStatuses(prev => ({
        ...prev,
        [quotationId]: newCallStatus
      }))

      const statusLabel = CallStatusLabels[newCallStatus]
      toast.success(`Arama durumu güncellendi: ${statusLabel}`)
    } catch (error) {
      console.error('Arama durumu güncelleme hatası:', error)
      toast.error('Arama durumu güncellenirken hata oluştu')
    }
  }

  const handleDeleteQuotation = async (quotationId: string, quotationNumber: string) => {
    if (!confirm(`"${quotationNumber}" numaralı teklifi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return
    }

    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Teklif başarıyla silindi')
        // Re-fetch to get fresh pagination + stats
        fetchQuotations(currentPage, appliedSearch, statusFilter)
      } else {
        const errorData = await response.json()
        console.error('Teklif silinemedi:', errorData.error)
        toast.error('Teklif silinemedi: ' + errorData.error)
      }
    } catch (error) {
      console.error('Teklif silme hatası:', error)
      toast.error('Teklif silinirken bir hata oluştu')
    }
  }

  // Build a compact list of page numbers to render in the pagination control
  const buildPageItems = (): (number | 'ellipsis')[] => {
    const total = pagination.totalPages
    const current = currentPage
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    const items: (number | 'ellipsis')[] = [1]
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    if (start > 2) items.push('ellipsis')
    for (let p = start; p <= end; p++) items.push(p)
    if (end < total - 1) items.push('ellipsis')
    items.push(total)
    return items
  }

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

  const getStatusBadgeClass = (status: QuotationStatus) => {
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

  const getCallStatusBadgeClass = (status: CallStatus) => {
    switch (status) {
      case 'arandı':
        return 'bg-green-100 text-green-800'
      case '1 daha ara':
        return 'bg-yellow-100 text-yellow-800'
      case 'takip et':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teklif Yönetimi</h1>
          <p className="text-muted-foreground text-sm">
            Müşteri tekliflerinizi görüntüleyin ve yönetin
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {appliedSearch || statusFilter !== 'all' ? 'Filtreye uyan' : 'Tüm zamanlar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gönderilen Teklifler</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentCount}</div>
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
              {formatPrice(stats.totalTL, 'TL')}
            </div>
            <p className="text-xs text-muted-foreground">
              Türk Lirası cinsinden
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Teklif no, başlık, müşteri adı, telefon veya e-posta ile ara..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-20"
            inputMode="search"
          />
          {searchInput && searchInput !== appliedSearch && (
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1 h-7 px-2 text-xs"
            >
              Ara
            </Button>
          )}
          {appliedSearch && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="absolute right-2 top-3 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Aramayı temizle"
            >
              {searchInput === appliedSearch ? '×' : ''}
            </button>
          )}
        </form>

        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
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
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Yükleniyor...
              </span>
            ) : (
              <>
                {stats.total} teklif bulundu
                {pagination.totalPages > 1 && (
                  <span className="text-muted-foreground">
                    {' '}· Sayfa {currentPage} / {pagination.totalPages}
                  </span>
                )}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.total === 0 && !isLoading ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {appliedSearch || statusFilter !== 'all'
                  ? 'Filtreye uyan teklif bulunamadı'
                  : 'Henüz teklif bulunmuyor'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {appliedSearch || statusFilter !== 'all'
                  ? 'Farklı bir arama veya filtre deneyin.'
                  : 'İlk teklifinizi oluşturmak için başlayın.'}
              </p>
              {appliedSearch || statusFilter !== 'all' ? (
                <Button variant="outline" onClick={handleSearchClear}>
                  Aramayı temizle
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/teklifler/yeni">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Teklif Oluştur
                  </Link>
                </Button>
              )}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Teklifler yükleniyor...
            </div>
          ) : (
            <>
              {/* Masaüstü tablo görünümü */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teklif No / Başlık</TableHead>
                      <TableHead>Müşteri / Telefon</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Arama Durumu</TableHead>
                      <TableHead>Toplam (TL)</TableHead>
                      <TableHead>Toplam (USD)</TableHead>
                      <TableHead>Geçerlilik</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quotation: any) => (
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
                            {quotation.customer?.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Phone className="h-3 w-3" />
                                {quotation.customer.phone}
                              </div>
                            )}
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
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(statusValue)}`}>
                                    {QuotationStatusLabels[statusValue]}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={callStatuses[quotation.id] || 'arandı'}
                            onValueChange={(value: CallStatus) => handleCallStatusUpdate(quotation.id, value)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CALL_STATUSES.map((callStatusValue) => (
                                <SelectItem key={callStatusValue} value={callStatusValue}>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCallStatusBadgeClass(callStatusValue)}`}>
                                    {CallStatusLabels[callStatusValue]}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuotation(quotation.id, quotation.quotationNumber)}
                              title="Sil"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
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

              {/* Mobil kart görünümü */}
              <div className="md:hidden space-y-3">
                {quotations.map((quotation: any) => {
                  const callStatus: CallStatus = callStatuses[quotation.id] || 'arandı'
                  return (
                    <Card key={quotation.id} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-xs text-muted-foreground">
                              {quotation.quotationNumber}
                            </div>
                            <div className="font-medium truncate">
                              {quotation.customer?.companyName || 'Müşteri yok'}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {quotation.title}
                            </div>
                          </div>
                          <Badge className={`${getStatusBadgeClass(quotation.status as QuotationStatus)} shrink-0`}>
                            {QuotationStatusLabels[quotation.status as QuotationStatus]}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">Müşteri</div>
                            <div className="truncate">{quotation.customer?.contactName || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Geçerlilik</div>
                            <div>
                              {quotation.validUntil
                                ? new Date(quotation.validUntil).toLocaleDateString('tr-TR')
                                : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Toplam (TL)</div>
                            <div className="font-mono">
                              {quotation.totalTL ? formatPrice(quotation.totalTL, 'TL') : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Toplam (USD)</div>
                            <div className="font-mono">
                              {quotation.totalUSD ? formatPrice(quotation.totalUSD, 'USD') : '-'}
                            </div>
                          </div>
                        </div>

                        {quotation.customer?.phone && (
                          <a
                            href={`tel:${quotation.customer.phone}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="h-3 w-3" />
                            {quotation.customer.phone}
                          </a>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={quotation.status}
                            onValueChange={(value: QuotationStatus) => handleStatusUpdate(quotation.id, value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(QuotationStatus).map((statusValue) => (
                                <SelectItem key={statusValue} value={statusValue}>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(statusValue)}`}>
                                    {QuotationStatusLabels[statusValue]}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={callStatus}
                            onValueChange={(value: CallStatus) => handleCallStatusUpdate(quotation.id, value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CALL_STATUSES.map((callStatusValue) => (
                                <SelectItem key={callStatusValue} value={callStatusValue}>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCallStatusBadgeClass(callStatusValue)}`}>
                                    {CallStatusLabels[callStatusValue]}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-end gap-1 pt-1 border-t">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadPdf(quotation)}
                            title="PDF İndir"
                            className="h-9 w-9"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Görüntüle"
                            className="h-9 w-9"
                          >
                            <Link href={`/teklifler/${quotation.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Düzenle"
                            className="h-9 w-9"
                          >
                            <Link href={`/teklifler/${quotation.id}/duzenle`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuotation(quotation.id, quotation.quotationNumber)}
                            title="Sil"
                            className="h-9 w-9 text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Sayfa başına {pagination.pageSize} kayıt
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={(e) => {
                            e.preventDefault()
                            goToPage(currentPage - 1)
                          }}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {buildPageItems().map((item, idx) => (
                        <PaginationItem key={`${item}-${idx}`}>
                          {item === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              isActive={item === currentPage}
                              onClick={(e) => {
                                e.preventDefault()
                                goToPage(item)
                              }}
                              className="cursor-pointer"
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={(e) => {
                            e.preventDefault()
                            goToPage(currentPage + 1)
                          }}
                          className={currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}