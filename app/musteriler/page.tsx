/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Search,
  Tags
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateCustomerTypeModal } from '@/components/modals/create-customer-type-modal'
import { CustomerType } from '@/lib/types'
import { Customer, SortField, SortDirection, CustomerTable } from '@/components/customer/customer-table'
import { CustomerStats } from '@/components/customer/customer-stats'
import { CustomerTypesTab } from '@/components/customer/customer-types-tab'

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
        customer.email?.toLowerCase().includes(searchLower) ||
        (customer.phone || '').includes(searchTerm) ||
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

  const handleNewTypeCreated = (newType: CustomerType) => {
    setCustomerTypes(prev => [...prev, newType])
    toast.success('Yeni müşteri tipi oluşturuldu')
  }

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
                <CustomerTable 
                  customers={sortedAndFilteredCustomers}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onDelete={handleDelete}
                />
              )}
            </CardContent>
          </Card>

          {/* İstatistikler */}
          <CustomerStats customers={customers} />
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <CustomerTypesTab 
            customerTypes={customerTypes}
            isLoading={isLoadingTypes}
            onTypeCreated={handleNewTypeCreated}
            onTypeDeleted={(typeId) => setCustomerTypes(prev => prev.filter(t => t.id !== typeId))}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}