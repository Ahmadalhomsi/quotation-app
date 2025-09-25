'use client'

import { useState } from 'react'
import { Plus, Check, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomerType } from '@/lib/types'

const CATEGORIES = [
  { value: 'status', label: 'Durum', color: '#3B82F6' },
  { value: 'priority', label: 'Öncelik', color: '#DC2626' },
  { value: 'source', label: 'Kaynak', color: '#8B5CF6' },
  { value: 'behavior', label: 'Davranış', color: '#059669' },
  { value: 'custom', label: 'Özel', color: '#6B7280' }
]

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#374151', '#111827'
]

interface CreateCustomerTypeModalProps {
  onTypeCreated: (newType: CustomerType) => void
  trigger?: React.ReactNode
}

export function CreateCustomerTypeModal({ onTypeCreated, trigger }: CreateCustomerTypeModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: '#6B7280',
    description: '',
    category: 'custom'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setErrors({ name: 'Tip adı gereklidir' })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/customer-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error) {
          setErrors({ general: data.error })
        }
        return
      }

      // Success
      onTypeCreated(data.customerType)
      setOpen(false)
      setFormData({
        name: '',
        color: '#6B7280',
        description: '',
        category: 'custom'
      })
      setErrors({})

    } catch (error) {
      console.error('Error creating customer type:', error)
      setErrors({ general: 'Müşteri tipi oluşturulurken bir hata oluştu' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Yeni Tip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Müşteri Tipi Oluştur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Tip Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Örn: Premium Müşteri"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Renk</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isSubmitting}
                >
                  {formData.color === color && (
                    <Check className="h-4 w-4 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
            <Input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Bu tip hakkında kısa açıklama..."
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}