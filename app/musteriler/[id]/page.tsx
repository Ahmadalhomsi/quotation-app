'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit,
  Trash2
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string | null
  phone: string
  address: string | null
  taxNumber: string | null
  taxOffice: string | null
  createdAt: string
  updatedAt: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/customers/${customerId}`)
        
        if (!response.ok) {
          throw new Error('Müşteri bilgileri alınamadı')
        }
        
        const data = await response.json()
        setCustomer(data.customer)
      } catch (error) {
        console.error('Müşteri yüklenemedi:', error)
        setError(error instanceof Error ? error.message : 'Müşteri yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  const handleDelete = async () => {
    if (!customer) return
    
    if (!confirm(`"${customer.companyName}" müşterisini silmek istediğinizden emin misiniz?`)) return

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (response.status === 409) {
        toast.error('Bu müşteriye ait teklifler bulunduğu için silinemez')
        return
      }

      if (response.status === 404) {
        toast.error('Müşteri bulunamadı')
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Müşteri silinemedi')
      }

      toast.success('Müşteri başarıyla silindi')
      // Redirect to customers list
      window.location.href = '/musteriler'
    } catch (error) {
      console.error('Müşteri silme hatası:', error)
      toast.error('Müşteri silinirken bir hata oluştu')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/musteriler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Detayları</h1>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/musteriler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Detayları</h1>
            <p className="text-red-600">{error || 'Müşteri bulunamadı'}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium mb-2">Müşteri Bulunamadı</h3>
            <p className="text-muted-foreground mb-4">{error || 'Bu müşteri mevcut değil'}</p>
            <Button asChild>
              <Link href="/musteriler">Müşterilere Dön</Link>
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
            <Link href="/musteriler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.companyName}</h1>
            <p className="text-muted-foreground">
              Müşteri Detayları
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/musteriler/${customer.id}/duzenle`}>
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
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Şirket Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Şirket Adı</div>
                  <div className="text-lg font-semibold">{customer.companyName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">İletişim Kişisi</div>
                  <div className="text-lg">{customer.contactName}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>İletişim Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">E-posta</div>
                    <div>{customer.email || 'Belirtilmemiş'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Telefon</div>
                    <div className="font-mono">{customer.phone}</div>
                  </div>
                </div>
              </div>
              
              {customer.address && (
                <>
                  <Separator />
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Adres</div>
                      <div className="whitespace-pre-wrap">{customer.address}</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tax Information */}
          {(customer.taxNumber || customer.taxOffice) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Vergi Bilgileri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {customer.taxNumber && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Vergi Numarası</div>
                      <div className="font-mono">{customer.taxNumber}</div>
                    </div>
                  )}
                  {customer.taxOffice && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Vergi Dairesi</div>
                      <div>{customer.taxOffice}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Durum</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="mb-4">
                Aktif Müşteri
              </Badge>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Kayıt Tarihi</div>
                  <div>{new Date(customer.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Son Güncelleme</div>
                  <div>{new Date(customer.updatedAt).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href={`/teklifler/yeni?customerId=${customer.id}`}>
                  Yeni Teklif Oluştur
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/musteriler/${customer.id}/duzenle`}>
                  Bilgileri Düzenle
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toplam Teklif:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Onaylanan:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bekleyen:</span>
                <span className="font-medium">0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}