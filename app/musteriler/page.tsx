'use client'

import { useState } from 'react'
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

// Mock data - bu gerçek uygulamada API'den gelecek
const mockCustomers = [
  {
    id: '1',
    companyName: 'ABC Teknoloji A.Ş.',
    contactName: 'Ahmet Yılmaz',
    email: 'ahmet@abcteknoloji.com',
    phone: '+90 212 123 45 67',
    address: 'Maslak Mahallesi, Büyükdere Cad. No: 123, Şişli/İstanbul',
    taxNumber: '1234567890',
    taxOffice: 'Maslak V.D.',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    companyName: 'XYZ Perakende Ltd.',
    contactName: 'Ayşe Demir',
    email: 'ayse@xyzperakende.com',
    phone: '+90 312 987 65 43',
    address: 'Çankaya Mahallesi, Atatürk Bulvarı No: 456, Çankaya/Ankara',
    taxNumber: '0987654321',
    taxOffice: 'Çankaya V.D.',
    createdAt: new Date('2024-01-10')
  }
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCustomers = mockCustomers.filter(customer => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.companyName.toLowerCase().includes(searchLower) ||
      customer.contactName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      customer.taxNumber?.includes(searchTerm)
    )
  })

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
              <h3 className="text-lg font-medium mb-2">Müşteri bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Henüz müşteri eklenmemiş'}
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
                        <div>VN: {customer.taxNumber}</div>
                        <div className="text-muted-foreground">{customer.taxOffice}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {customer.createdAt.toLocaleDateString('tr-TR')}
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
            <div className="text-2xl font-bold">{mockCustomers.length}</div>
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
            <div className="text-2xl font-bold">2</div>
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