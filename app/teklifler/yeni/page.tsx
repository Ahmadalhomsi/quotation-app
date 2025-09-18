'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { QuotationForm } from '@/components/forms/quotation-form'
import {
  Currency,
  CreateQuotationData
} from '@/lib/types'

// Types for API data
interface Customer {
  id: string
  companyName: string
  contactName: string
  email?: string
}

interface Product {
  id: string
  name: string
  price: number
  currency: Currency
  description?: string
}

interface QuotationItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  currency: Currency
  discount?: number
  product?: Product
  totalPrice: number
}

export default function NewQuotationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)

        const [customersResponse, productsResponse] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products?active=true')
        ])

        if (!customersResponse.ok) {
          throw new Error('Müşteriler alınamadı')
        }

        if (!productsResponse.ok) {
          throw new Error('Ürünler alınamadı')
        }

        const customersData = await customersResponse.json()
        const productsData = await productsResponse.json()

        setCustomers(customersData.customers || [])
        setProducts(productsData.products || [])

      } catch (error) {
        console.error('Veri yükleme hatası:', error)
        setError(error instanceof Error ? error.message : 'Veriler yüklenirken hata oluştu')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const handleCustomerCreated = (customer: Customer) => {
    setCustomers(prev => [...prev, customer])
  }

  const handleProductCreated = (product: Product) => {
    setProducts(prev => [...prev, product])
  }

  const handleSubmit = async (
    formData: CreateQuotationData,
    items: QuotationItem[],
    kdvEnabled: boolean,
    kdvRate: number,
    exchangeRate: number
  ) => {
    setIsLoading(true)

    try {
      const quotationData = {
        ...formData,
        kdvEnabled,
        kdvRate,
        exchangeRate,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          currency: item.currency,
          discount: item.discount || 0,
          productName: item.product?.name || '',
        }))
      }

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quotationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Teklif oluşturulamadı')
      }

      const result = await response.json()
      toast.success('Teklif başarıyla oluşturuldu!')
      router.push(`/teklifler/${result.quotation.id}`)

    } catch (error) {
      console.error('Teklif oluşturma hatası:', error)
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/teklifler">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Yeni Teklif</h1>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Veriler yükleniyor...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/teklifler">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Yeni Teklif</h1>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium mb-2">Hata</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/teklifler">Tekliflere Dön</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Başlık */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/teklifler">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Yeni Teklif Oluştur</h1>
              <p className="text-muted-foreground">
                Müşterileriniz için profesyonel teklifler hazırlayın
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/teklifler">
              <FileText className="mr-2 h-4 w-4" />
              Tüm Teklifler
            </Link>
          </Button>
        </div>

        {/* Quotation Form */}
        <QuotationForm
          mode="create"
          onSubmit={handleSubmit}
          customers={customers}
          products={products}
          onCustomerCreated={handleCustomerCreated}
          onProductCreated={handleProductCreated}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}