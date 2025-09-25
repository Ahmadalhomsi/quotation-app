'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { CustomerForm, CustomerFormData } from '@/components/customer/customer-form'

export default function NewCustomerPage() {
  const router = useRouter()
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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Müşteri oluşturulamadı')
      }

      const customer = await response.json()
      toast.success('Müşteri başarıyla oluşturuldu')
      router.push(`/musteriler/${customer.id}`)
    } catch (error) {
      console.error('Müşteri oluşturma hatası:', error)
      toast.error('Müşteri oluşturulurken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Yeni Müşteri</h1>
            <p className="text-muted-foreground">
              Yeni müşteri kaydı oluşturun
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