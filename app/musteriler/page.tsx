'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  Building,
  Mail,
  Phone
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Types for API data
interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string | null
  taxNumber: string | null
  taxOffice: string | null
  createdAt: string
  updatedAt: string
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/customers')
        
        if (!response.ok) {
          throw new Error('Müşteriler alınamadı')
        }
        
        const data = await response.json()
        setCustomers(data.customers || [])
      } catch (error) {
        console.error('Müşteriler yüklenemedi:', error)
        setError(error instanceof Error ? error.message : 'Müşteriler yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.companyName.toLowerCase().includes(searchLower) ||
      customer.contactName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      customer.taxNumber?.includes(searchTerm)
    )
  })

  const handleDelete = async (customerId: string) => {

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

      // Remove from local state
      setCustomers(prev => prev.filter(c => c.id !== customerId))
      toast.success('Müşteri başarıyla silindi')
    } catch (error) {
      console.error('Müşteri silme hatası:', error)
      toast.error('Müşteri silinirken bir hata oluştu')
    }
  }

  // Calculate statistics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const customersThisMonth = customers.filter(customer => {
    const createdDate = new Date(customer.createdAt)
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
  }).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Yönetimi</h1>
            <p className="text-muted-foreground">Veriler yükleniyor...</p>
          </div>
          <Button asChild>
            <Link href="/musteriler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Müşteri
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
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Yönetimi</h1>
            <p className="text-red-600">{error}</p>
          </div>
          <Button asChild>
            <Link href="/musteriler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Müşteri
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
          <h1 className="text-3xl font-bold tracking-tight">Müşteri Yönetimi</h1>
          <p className="text-muted-foreground">
            Müşterilerinizi görüntüleyin ve yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/musteriler/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Müşteri
          </Link>
        </Button>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Müşteri Arama</CardTitle>
          <CardDescription>Müşterilerinizi arayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Şirket adı, kişi adı, e-posta, telefon veya vergi numarası ile arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Müşteri Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Müşteriler ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {customers.length === 0 ? 'Henüz müşteri eklenmemiş' : 'Müşteri bulunamadı'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Veritabanında müşteri bulunamadı. İlk müşterinizi ekleyin.'}
              </p>
              <Button asChild>
                <Link href="/musteriler/yeni">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Müşteriyi Ekle
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Şirket / İletişim</TableHead>
                  <TableHead>İletişim Bilgileri</TableHead>
                  <TableHead>Vergi Bilgileri</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{customer.companyName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.contactName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>VN: {customer.taxNumber || 'Belirtilmemiş'}</div>
                        <div className="text-muted-foreground">{customer.taxOffice || 'Belirtilmemiş'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/musteriler/${customer.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/musteriler/${customer.id}/duzenle`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(customer.id)}
                        >
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

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Müşteri
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Sistemde kayıtlı
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
            <div className="text-2xl font-bold">{customersThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Yeni müşteri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Teklifler
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Bekleyen teklif
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}