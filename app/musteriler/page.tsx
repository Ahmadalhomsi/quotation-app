/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Phone,
  Tags,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateCustomerTypeModal } from '@/components/modals/create-customer-type-modal'
import { CustomerType } from '@/lib/types'

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
  priority: number
  source: string | null
  notes: string | null
  lastContact: string | null
  nextContact: string | null
  customerTypes?: Array<{
    id: string
    typeId: string
    type: {
      id: string
      name: string
      color: string
      category?: string
      description?: string
    }
  }>
  _count?: {
    quotations: number
  }
  createdAt: string
  updatedAt: string
}

type SortField = 'companyName' | 'contactName' | 'email' | 'phone' | 'priority' | 'quotations' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('customers')
  const [sortField, setSortField] = useState<SortField>('companyName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Fetch customers and customer types from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setIsLoadingTypes(true)
        
        const [customersResponse, typesResponse] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/customer-types')
        ])
        
        if (!customersResponse.ok) {
          throw new Error('Müşteriler alınamadı')
        }
        
        const customersData = await customersResponse.json()
        setCustomers(customersData.customers || [])
        
        if (typesResponse.ok) {
          const typesData = await typesResponse.json()
          setCustomerTypes(typesData.customerTypes || [])
        }
        
        setIsLoadingTypes(false)
      } catch (error) {
        console.error('Veriler yüklenemedi:', error)
        setError(error instanceof Error ? error.message : 'Veriler yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedAndFilteredCustomers = customers
    .filter(customer => {
      const searchLower = searchTerm.toLowerCase()
      return (
        customer.companyName.toLowerCase().includes(searchLower) ||
        customer.contactName.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchTerm) ||
        customer.taxNumber?.includes(searchTerm)
      )
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'companyName':
          aValue = a.companyName.toLowerCase()
          bValue = b.companyName.toLowerCase()
          break
        case 'contactName':
          aValue = a.contactName.toLowerCase()
          bValue = b.contactName.toLowerCase()
          break
        case 'email':
          aValue = a.email?.toLowerCase() || ''
          bValue = b.email?.toLowerCase() || ''
          break
        case 'phone':
          aValue = a.phone || ''
          bValue = b.phone || ''
          break
        case 'priority':
          aValue = a.priority
          bValue = b.priority
          break
        case 'quotations':
          aValue = a._count?.quotations || 0
          bValue = b._count?.quotations || 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </Button>
  )

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

  const handleDeleteCustomerType = async (typeId: string) => {
    try {
      const response = await fetch(`/api/customer-types/${typeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Müşteri tipi silinemedi')
      }

      // Remove from local state
      setCustomerTypes(prev => prev.filter(t => t.id !== typeId))
      toast.success('Müşteri tipi başarıyla silindi')
    } catch (error) {
      console.error('Müşteri tipi silme hatası:', error)
      toast.error(error instanceof Error ? error.message : 'Müşteri tipi silinirken bir hata oluştu')
    }
  }

  const handleNewTypeCreated = (newType: CustomerType) => {
    setCustomerTypes(prev => [...prev, newType])
    toast.success('Yeni müşteri tipi oluşturuldu')
  }

  // Calculate statistics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const customersThisMonth = customers.filter(customer => {
    const createdDate = new Date(customer.createdAt)
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
  }).length

  // Calculate total quotations
  const totalQuotations = customers.reduce((total, customer) => {
    return total + (customer._count?.quotations || 0)
  }, 0)

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
            Müşterilerinizi ve müşteri tiplerini yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <CreateCustomerTypeModal onTypeCreated={handleNewTypeCreated} />
          <Button asChild>
            <Link href="/musteriler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Müşteri
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Müşteriler ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Müşteri Tipleri ({customerTypes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
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
                Müşteriler ({sortedAndFilteredCustomers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedAndFilteredCustomers.length === 0 ? (
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
                      <TableHead className="w-[200px]">
                        <SortButton field="companyName">Şirket / İletişim</SortButton>
                      </TableHead>
                      <TableHead className="w-[180px]">
                        <SortButton field="email">İletişim Bilgileri</SortButton>
                      </TableHead>
                      <TableHead className="w-[220px]">
                        <SortButton field="priority">Müşteri Tipleri & Öncelik</SortButton>
                      </TableHead>
                      <TableHead className="w-[100px]">
                        <SortButton field="quotations">
                          <div className="flex items-center justify-center gap-1">
                            <FileText className="h-4 w-4" />
                            Teklifler
                          </div>
                        </SortButton>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <SortButton field="createdAt">Kayıt Tarihi</SortButton>
                      </TableHead>
                      <TableHead className="text-right w-[120px]">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAndFilteredCustomers.map((customer) => (
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
                              <span>{customer.email || 'Belirtilmemiş'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{customer.phone || 'Belirtilmemiş'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {/* Priority */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground min-w-[45px]">Öncelik:</span>
                              <Badge 
                                variant={customer.priority === 3 ? 'destructive' : customer.priority === 2 ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {customer.priority === 3 ? 'Yüksek' : customer.priority === 2 ? 'Orta' : 'Düşük'}
                              </Badge>
                            </div>
                            
                            {/* Customer Types */}
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground">Tipler:</span>
                              </div>
                              {customer.customerTypes && customer.customerTypes.length > 0 ? (
                                <div className="space-y-1">
                                  {Object.entries(
                                    customer.customerTypes.reduce((acc, customerType) => {
                                      const category = customerType.type.category || 'custom'
                                      if (!acc[category]) {
                                        acc[category] = []
                                      }
                                      acc[category].push(customerType)
                                      return acc
                                    }, {} as Record<string, typeof customer.customerTypes>)
                                  ).map(([category, types]) => (
                                    <div key={category} className="flex flex-wrap gap-1">
                                      {types.map((customerType) => (
                                        <Badge 
                                          key={customerType.id}
                                          variant="outline" 
                                          className="text-xs px-2 py-0.5 cursor-pointer hover:opacity-80"
                                          style={{ 
                                            backgroundColor: customerType.type.color + '15',
                                            borderColor: customerType.type.color + '50',
                                            color: customerType.type.color
                                          }}
                                          title={`${customerType.type.name}${customerType.type.description ? ` - ${customerType.type.description}` : ''}`}
                                        >
                                          {customerType.type.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Tip Belirtilmemiş
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            {customer._count?.quotations ? (
                              <Badge variant="default" className="text-xs">
                                {customer._count.quotations} Teklif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                Teklif Yok
                              </Badge>
                            )}
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
                  Toplam Teklifler
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuotations}</div>
                <p className="text-xs text-muted-foreground">
                  Oluşturulan teklif
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          {/* Customer Types Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Müşteri Tipleri</CardTitle>
              <CardDescription>Müşteri tiplerini görüntüleyin ve yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTypes ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Müşteri tipleri yükleniyor...</p>
                </div>
              ) : customerTypes.length === 0 ? (
                <div className="text-center py-12">
                  <Tags className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Henüz müşteri tipi eklenmemiş</h3>
                  <p className="text-muted-foreground mb-4">
                    İlk müşteri tipinizi oluşturun
                  </p>
                  <CreateCustomerTypeModal onTypeCreated={handleNewTypeCreated} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Types by Category */}
                  {Object.entries(
                    customerTypes.reduce((acc, type) => {
                      const category = type.category || 'custom'
                      if (!acc[category]) {
                        acc[category] = []
                      }
                      acc[category].push(type)
                      return acc
                    }, {} as Record<string, CustomerType[]>)
                  ).map(([category, types]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        {category === 'status' && 'Durum'}
                        {category === 'priority' && 'Öncelik'}
                        {category === 'source' && 'Kaynak'}
                        {category === 'behavior' && 'Davranış'}
                        {category === 'custom' && 'Özel'}
                      </h4>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {types.map((type) => (
                          <Card key={type.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: type.color }}
                                />
                                <div>
                                  <p className="font-medium text-sm">{type.name}</p>
                                  {type.description && (
                                    <p className="text-xs text-muted-foreground">{type.description}</p>
                                  )}
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteCustomerType(type.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}