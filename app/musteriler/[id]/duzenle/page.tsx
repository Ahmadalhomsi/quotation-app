'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { CustomerForm, CustomerFormData } from '@/components/customer/customer-form'

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [formData, setFormData] = useState<CustomerFormData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    taxOffice: '',
    priority: 2,
    source: '',
    notes: '',
    nextContact: undefined,
    typeIds: [] // Unified customer types
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch existing customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${customerId}`)
        
        if (!response.ok) {
          throw new Error('Müşteri bilgileri alınamadı')
        }
        
        const data = await response.json()
        const customer = data.customer
        
        setFormData({
          companyName: customer.companyName || '',
          contactName: customer.contactName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          taxNumber: customer.taxNumber || '',
          taxOffice: customer.taxOffice || '',
          priority: customer.priority || 2,
          source: customer.source || '',
          notes: customer.notes || '',
          nextContact: customer.nextContact ? new Date(customer.nextContact) : undefined,
          typeIds: customer.customerTypes?.map((ct: { typeId: string }) => ct.typeId) || []
        })
      } catch (error) {
        console.error('Müşteri yükleme hatası:', error)
        toast.error('Müşteri bilgileri yüklenirken bir hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Şirket adı gereklidir'
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'İletişim kişisi gereklidir'
    }

    // Phone is optional now
    // if (!formData.phone.trim()) {
    //   newErrors.phone = 'Telefon numarası gereklidir'
    // }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CustomerFormData, value: string | number | Date | undefined | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Lütfen tüm gerekli alanları doldurun')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Müşteri güncellenemedi')
      }

      toast.success('Müşteri başarıyla güncellendi')
      router.push(`/musteriler/${customerId}`)
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error)
      toast.error('Müşteri güncellenirken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
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
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Düzenle</h1>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/musteriler/${customerId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Düzenle</h1>
            <p className="text-muted-foreground">
              Müşteri bilgilerini güncelleyin
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      {/* Customer Form */}
      <form onSubmit={handleSubmit}>
        <CustomerForm
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  )
}