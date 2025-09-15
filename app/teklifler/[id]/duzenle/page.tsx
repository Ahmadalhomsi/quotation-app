'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { QuotationForm } from '@/components/forms/quotation-form'
import { 
  QuotationStatus, 
  ProductType, 
  Currency, 
  CreateQuotationData 
} from '@/lib/types'

// Types matching the API response
interface QuotationDetail {
  id: string
  quotationNumber: string
  title: string
  description: string | null
  status: QuotationStatus
  customerId: string
  customer: {
    id: string
    companyName: string
    contactName: string
    email: string
    phone: string | null
    address: string | null
    taxNumber: string | null
    taxOffice: string | null
  }
  totalTL: number | null
  totalUSD: number | null
  exchangeRate: number
  kdvEnabled: boolean
  kdvRate: number
  validUntil: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    quotationId: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    currency: Currency
    discount?: number
    product: {
      id: string
      name: string
      type: ProductType
      price: number
      currency: Currency
      description: string | null
    }
  }>
  terms: string | null
  notes: string | null
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  currency: Currency
  type: ProductType
}

interface Customer {
  id: string
  companyName: string
  contactName: string
  email?: string
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

export default function EditQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch quotation, products, and customers in parallel
        const [quotationRes, productsRes, customersRes] = await Promise.all([
          fetch(`/api/quotations/${params.id}`),
          fetch('/api/products?active=true'),
          fetch('/api/customers')
        ])

        if (!quotationRes.ok) {
          throw new Error('Teklif bulunamadı')
        }

        const quotationData = await quotationRes.json()
        const productsData = productsRes.ok ? await productsRes.json() : { products: [] }
        const customersData = customersRes.ok ? await customersRes.json() : { customers: [] }

        setQuotation(quotationData)
        setProducts(productsData.products || [])
        setCustomers(customersData.customers || [])

      } catch (error) {
        console.error('Veriler yüklenemedi:', error)
        setError(error instanceof Error ? error.message : 'Veriler yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleCustomerCreated = (customer: Customer) => {
    setCustomers(prev => [...prev, customer])
  }

  const handleProductCreated = (product: { 
    id: string
    name: string
    description?: string
    price: number
    currency: Currency
    type: ProductType
  }) => {
    setProducts(prev => [...prev, product])
  }

  const handleSubmit = async (
    formData: CreateQuotationData, 
    items: QuotationItem[], 
    kdvEnabled: boolean, 
    kdvRate: number, 
    exchangeRate: number
  ) => {
    setIsSaving(true)

    try {
      const updatedQuotation = {
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
          productType: item.product?.type || ProductType.SOFTWARE
        }))
      }

      const response = await fetch(`/api/quotations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedQuotation)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Teklif güncellenemedi')
      }

      alert('Teklif başarıyla güncellendi!')
      router.push(`/teklifler/${params.id}`)

    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/teklifler">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Teklif Düzenle</h1>
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

  if (error || !quotation) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/teklifler">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Teklif Düzenle</h1>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium mb-2">Hata</h3>
              <p className="text-muted-foreground mb-4">{error || 'Teklif bulunamadı'}</p>
              <Button asChild>
                <Link href="/teklifler">Tekliflere Dön</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Convert quotation data to the format expected by QuotationForm
  const initialData: CreateQuotationData = {
    title: quotation.title,
    description: quotation.description || '',
    customerId: quotation.customerId,
    validUntil: new Date(quotation.validUntil),
    terms: quotation.terms || '',
    notes: quotation.notes || '',
    items: []
  }

  const initialItems: QuotationItem[] = quotation.items.map(item => ({
    id: item.id,
    productId: item.productId,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    currency: item.currency,
    discount: Number(item.discount) || 0,
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description || undefined,
      price: Number(item.product.price),
      currency: item.product.currency,
      type: item.product.type
    },
    totalPrice: Number(item.totalPrice)
  }))

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Başlık */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/teklifler/${quotation.id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Teklif Düzenle</h1>
              <p className="text-muted-foreground">{quotation.quotationNumber}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/teklifler/${quotation.id}`}>
              <X className="mr-2 h-4 w-4" />
              İptal
            </Link>
          </Button>
        </div>

        {/* Quotation Form */}
        <QuotationForm
          mode="edit"
          onSubmit={handleSubmit}
          customers={customers}
          products={products}
          onCustomerCreated={handleCustomerCreated}
          onProductCreated={handleProductCreated}
          isLoading={isSaving}
          initialData={initialData}
          initialItems={initialItems}
          initialKdvEnabled={quotation.kdvEnabled}
          initialKdvRate={quotation.kdvRate}
          initialExchangeRate={quotation.exchangeRate}
        />
      </div>
    </div>
  )
}


