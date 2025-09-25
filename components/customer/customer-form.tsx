'use client'

import { useState, useEffect } from 'react'
import { Building, Target, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CustomerType } from '@/lib/types'
import { CreateCustomerTypeModal } from '@/components/modals/create-customer-type-modal'

export interface CustomerFormData {
  companyName: string
  contactName: string
  email: string  // Keep as string for form handling, but allow empty
  phone: string  // Keep as string for form handling, but allow empty
  address: string
  taxNumber: string
  taxOffice: string
  priority: number
  source: string
  notes: string
  nextContact: Date | undefined
  typeIds: string[] // Unified customer types
}

interface CustomerFormProps {
  formData: CustomerFormData
  errors: Record<string, string>
  onInputChange: (field: keyof CustomerFormData, value: string | number | Date | undefined | string[]) => void
  isSubmitting?: boolean
}

export function CustomerForm({ formData, errors, onInputChange, isSubmitting = false }: CustomerFormProps) {
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)

  // Fetch customer types on component mount
  useEffect(() => {
    fetchCustomerTypes()
  }, [])

  const fetchCustomerTypes = async () => {
    try {
      setLoadingTypes(true)
      const response = await fetch('/api/customer-types')

      if (response.ok) {
        const data = await response.json()
        setCustomerTypes(data.customerTypes || [])
      }
    } catch (error) {
      console.error('Error fetching customer types:', error)
    } finally {
      setLoadingTypes(false)
    }
  }

  const handleTypeToggle = (typeId: string) => {
    const currentTypes = formData.typeIds || []
    if (currentTypes.includes(typeId)) {
      // Remove type
      onInputChange('typeIds', currentTypes.filter(id => id !== typeId))
    } else {
      // Add type
      onInputChange('typeIds', [...currentTypes, typeId])
    }
  }

  const handleNewTypeCreated = (newType: CustomerType) => {
    setCustomerTypes(prev => [...prev, newType])
  }

  // Group types by category for better organization
  const typesByCategory = customerTypes.reduce((acc, type) => {
    const category = type.category || 'custom'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(type)
    return acc
  }, {} as Record<string, CustomerType[]>)

  const categoryLabels = {
    status: 'Durum',
    priority: 'Öncelik', 
    source: 'Kaynak',
    behavior: 'Davranış',
    custom: 'Özel'
  }

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Şirket Bilgileri</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Şirket Adı *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => onInputChange('companyName', e.target.value)}
                placeholder="Şirket adını girin"
                disabled={isSubmitting}
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
                onChange={(e) => onInputChange('contactName', e.target.value)}
                placeholder="İletişim kişisinin adını girin"
                disabled={isSubmitting}
              />
              {errors.contactName && (
                <p className="text-sm text-red-600">{errors.contactName}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                placeholder="email@example.com"
                disabled={isSubmitting}
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
                onChange={(e) => onInputChange('phone', e.target.value)}
                placeholder="+90 (555) 123-4567"
                disabled={isSubmitting}
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
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="Tam adres bilgisini girin"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taxNumber">Vergi Numarası</Label>
              <Input
                id="taxNumber"
                value={formData.taxNumber}
                onChange={(e) => onInputChange('taxNumber', e.target.value)}
                placeholder="1234567890"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxOffice">Vergi Dairesi</Label>
              <Input
                id="taxOffice"
                value={formData.taxOffice}
                onChange={(e) => onInputChange('taxOffice', e.target.value)}
                placeholder="Vergi dairesi adını girin"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Pazarlama Bilgileri</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Müşteri Tipleri</Label>
              <CreateCustomerTypeModal 
                onTypeCreated={handleNewTypeCreated}
                trigger={
                  <Button variant="outline" size="sm" disabled={isSubmitting}>
                    <Plus className="h-4 w-4 mr-1" />
                    Yeni Tip
                  </Button>
                }
              />
            </div>
            
            {loadingTypes ? (
              <div className="text-sm text-muted-foreground">Yükleniyor...</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(typesByCategory).map(([category, types]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      {categoryLabels[category as keyof typeof categoryLabels] || category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {types.map((type) => {
                        const isSelected = formData.typeIds?.includes(type.id) || false
                        return (
                          <Badge
                            key={type.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer transition-all hover:opacity-80 ${
                              isSelected ? 'opacity-100' : 'opacity-60'
                            }`}
                            style={{
                              backgroundColor: isSelected ? type.color : 'transparent',
                              borderColor: type.color,
                              color: isSelected ? 'white' : type.color
                            }}
                            onClick={() => !isSubmitting && handleTypeToggle(type.id)}
                          >
                            {type.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                ))}
                
                {Object.keys(typesByCategory).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Henüz müşteri tipi yok. Yeni tip oluşturmak için &quot;Yeni Tip&quot; butonunu kullanın.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Öncelik</Label>
            <div className="flex gap-2">
              {[
                { value: 1, label: 'Düşük', color: '#6B7280' },
                { value: 2, label: 'Orta', color: '#F59E0B' },
                { value: 3, label: 'Yüksek', color: '#DC2626' }
              ].map((priority) => (
                <Badge
                  key={priority.value}
                  variant={formData.priority === priority.value ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: formData.priority === priority.value ? priority.color : 'transparent',
                    borderColor: priority.color,
                    color: formData.priority === priority.value ? 'white' : priority.color
                  }}
                  onClick={() => !isSubmitting && onInputChange('priority', priority.value)}
                >
                  {priority.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Müşteri Kaynağı</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => onInputChange('source', e.target.value)}
              placeholder="Örn: Website, Referans, Google Ads"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Pazarlama Notları</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onInputChange('notes', e.target.value)}
              placeholder="Müşteri ile ilgili önemli notlar..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextContact">Sonraki İletişim Tarihi</Label>
            <Input
              id="nextContact"
              type="datetime-local"
              value={formData.nextContact ? new Date(formData.nextContact).toISOString().slice(0, 16) : ''}
              onChange={(e) => onInputChange('nextContact', e.target.value ? new Date(e.target.value) : undefined)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}