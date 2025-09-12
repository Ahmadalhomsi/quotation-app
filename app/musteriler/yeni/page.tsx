'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Building, User, Mail, Phone, FileText } from 'lucide-react'

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
import { CreateCustomerData } from '@/lib/types'

export default function NewCustomerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCustomerData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    taxOffice: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Müşteri oluşturulamadı')
      }

      const result = await response.json()
      console.log('Müşteri başarıyla oluşturuldu:', result)
      
      // Başarılı olursa müşteriler sayfasına yönlendir
      router.push('/musteriler')
    } catch (error) {
      console.error('Müşteri oluşturma hatası:', error)
      alert(error instanceof Error ? error.message : 'Müşteri oluşturulurken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateCustomerData, value: string) => {
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

  return (
    <div className="space-y-6">
      {/* Başlık ve Navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/musteriler">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yeni Müşteri Ekle</h1>
          <p className="text-muted-foreground">
            Yeni müşteri kaydı oluşturun
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
                  Temel şirket bilgilerini girin
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
                    <p className="text-sm text-red-500">{errors.companyName}</p>
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
                    <p className="text-sm text-red-500">{errors.contactName}</p>
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
                    <Label htmlFor="email">E-posta Adresi</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="ornek@sirket.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+90 212 123 45 67"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
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
                      onChange={(e) => handleInputChange('taxNumber', e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567890"
                      maxLength={10}
                      className={errors.taxNumber ? 'border-red-500' : ''}
                    />
                    {errors.taxNumber && (
                      <p className="text-sm text-red-500">{errors.taxNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                    <Input
                      id="taxOffice"
                      value={formData.taxOffice}
                      onChange={(e) => handleInputChange('taxOffice', e.target.value)}
                      placeholder="Örn: Maslak V.D."
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
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formData.companyName || 'Şirket adı girilmedi'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formData.contactName || 'İletişim kişisi girilmedi'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formData.email || 'E-posta girilmedi'}
                    </span>
                  </div>
                  
                  {formData.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formData.phone}</span>
                    </div>
                  )}
                  
                  {formData.taxNumber && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">VN: {formData.taxNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bilgilendirme</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• Şirket adı ve iletişim kişisi zorunludur</li>
                  <li>• E-posta adresi teklif gönderimi için gereklidir</li>
                  <li>• Vergi bilgileri fatura düzenleme için kullanılır</li>
                  <li>• Tüm bilgiler daha sonra düzenlenebilir</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/musteriler">İptal</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Müşteriyi Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}