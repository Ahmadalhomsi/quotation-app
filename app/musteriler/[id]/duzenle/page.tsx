'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Building,
  Mail,
  FileText,
  Save
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string | null
  phone: string
  address: string | null
  taxNumber: string | null
  taxOffice: string | null
}

interface UpdateCustomerData {
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string
  taxNumber: string
  taxOffice: string
}

export default function EditCustomerPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState<UpdateCustomerData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    taxOffice: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch existing customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoadingData(true)
        const response = await fetch(`/api/customers/${customerId}`)
        
        if (!response.ok) {
          throw new Error('Müşteri bilgileri alınamadı')
        }
        
        const data = await response.json()
        const customer: Customer = data.customer
        
        setFormData({
          companyName: customer.companyName,
          contactName: customer.contactName,
          email: customer.email || '',
          phone: customer.phone,
          address: customer.address || '',
          taxNumber: customer.taxNumber || '',
          taxOffice: customer.taxOffice || ''
        })
      } catch (error) {
        console.error('Müşteri yüklenemedi:', error)
        alert('Müşteri bilgileri yüklenemedi')
        router.push('/musteriler')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (customerId) {
      fetchCustomer()
    }
  }, [customerId, router])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Zorunlu alanlar
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Şirket adı gereklidir'
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'İletişim kişisi gereklidir'
    }

    // Email validation (only if provided)
    if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }

    // Telefon numarası formatı (isteğe bağlı ama girildiyse geçerli olmalı)
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası girin'
    }

    // Vergi numarası formatı (isteğe bağlı ama girildiyse 10 haneli olmalı)
    if (formData.taxNumber && !/^\d{10}$/.test(formData.taxNumber)) {
      newErrors.taxNumber = 'Vergi numarası 10 haneli olmalıdır'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Müşteri güncellenemedi')
      }

      const result = await response.json()
      console.log('Müşteri başarıyla güncellendi:', result)
      
      // Başarılı olursa müşteri detay sayfasına yönlendir
      router.push(`/musteriler/${customerId}`)
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error)
      alert(error instanceof Error ? error.message : 'Müşteri güncellenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateCustomerData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (isLoadingData) {
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
      {/* Başlık ve Navigation */}
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
            {formData.companyName} bilgilerini güncelleyin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ana Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Şirket Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Şirket Bilgileri</span>
                </CardTitle>
                <CardDescription>
                  Şirket bilgilerini güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Şirket Adı *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Örn: ABC Teknoloji A.Ş."
                    className={errors.companyName ? 'border-red-500' : ''}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">İletişim Kişisi *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className={errors.contactName ? 'border-red-500' : ''}
                  />
                  {errors.contactName && (
                    <p className="text-sm text-red-600">{errors.contactName}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* İletişim Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>İletişim Bilgileri</span>
                </CardTitle>
                <CardDescription>
                  E-posta, telefon ve adres bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="ornek@email.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+90 555 123 45 67"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Tam adres bilgisi..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vergi Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Vergi Bilgileri</span>
                </CardTitle>
                <CardDescription>
                  Fatura için gerekli vergi bilgileri (isteğe bağlı)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">Vergi Numarası</Label>
                    <Input
                      id="taxNumber"
                      value={formData.taxNumber}
                      onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                      placeholder="1234567890"
                      maxLength={10}
                      className={errors.taxNumber ? 'border-red-500' : ''}
                    />
                    {errors.taxNumber && (
                      <p className="text-sm text-red-600">{errors.taxNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                    <Input
                      id="taxOffice"
                      value={formData.taxOffice}
                      onChange={(e) => handleInputChange('taxOffice', e.target.value)}
                      placeholder="Kadıköy"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Özet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Şirket:</span>
                    <br />
                    <span>{formData.companyName || 'Belirtilmemiş'}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Kişi:</span>
                    <br />
                    <span>{formData.contactName || 'Belirtilmemiş'}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">E-posta:</span>
                    <br />
                    <span>{formData.email || 'Belirtilmemiş'}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Telefon:</span>
                    <br />
                    <span>{formData.phone || 'Belirtilmemiş'}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">V. No:</span>
                    <br />
                    <span>{formData.taxNumber || 'Belirtilmemiş'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bilgilendirme</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• * ile işaretli alanlar zorunludur</li>
                  <li>• E-posta adresi teklif gönderimi için kullanılır</li>
                  <li>• Vergi bilgileri fatura düzenleme için gereklidir</li>
                  <li>• Tüm bilgiler güvenli olarak saklanır</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href={`/musteriler/${customerId}`}>İptal</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                Güncelleniyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}