'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CustomerActivityModalProps {
  customerId: string
  onActivityCreated?: () => void
}

interface ActivityFormData {
  type: string
  description: string
  result: string
  nextAction: string
  nextActionDate: string
  createdBy: string
}

export function CustomerActivityModal({ customerId, onActivityCreated }: CustomerActivityModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ActivityFormData>({
    type: '',
    description: '',
    result: '',
    nextAction: '',
    nextActionDate: '',
    createdBy: ''
  })

  const activityTypes = [
    'Telefon Araması',
    'E-posta Gönderimi',
    'WhatsApp Mesajı',
    'Demo Sunumu',
    'Ziyaret',
    'Teklif Sunumu',
    'Takip Araması',
    'Toplantı',
    'Diğer'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.type) {
      toast.error('Lütfen aktivite türünü seçin')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/customers/${customerId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Aktivite eklenemedi')
      }

      toast.success('Aktivite başarıyla eklendi')
      setOpen(false)
      setFormData({
        type: '',
        description: '',
        result: '',
        nextAction: '',
        nextActionDate: '',
        createdBy: ''
      })
      
      if (onActivityCreated) {
        onActivityCreated()
      }
    } catch (error) {
      console.error('Aktivite ekleme hatası:', error)
      toast.error(error instanceof Error ? error.message : 'Aktivite eklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ActivityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Aktivite Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Müşteri Aktivitesi</DialogTitle>
          <DialogDescription>
            Müşteri ile yapılan iletişimi kaydedin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Aktivite Türü</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aktivite türünü seçin" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Aktivite detaylarını açıklayın..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="result">Sonuç</Label>
            <Input
              id="result"
              value={formData.result}
              onChange={(e) => handleInputChange('result', e.target.value)}
              placeholder="Aktivitenin sonucu..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextAction">Sonraki Eylem</Label>
            <Input
              id="nextAction"
              value={formData.nextAction}
              onChange={(e) => handleInputChange('nextAction', e.target.value)}
              placeholder="Yapılacak sonraki işlem..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextActionDate">Sonraki Eylem Tarihi</Label>
            <Input
              id="nextActionDate"
              type="datetime-local"
              value={formData.nextActionDate}
              onChange={(e) => handleInputChange('nextActionDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="createdBy">İşlemi Yapan</Label>
            <Input
              id="createdBy"
              value={formData.createdBy}
              onChange={(e) => handleInputChange('createdBy', e.target.value)}
              placeholder="Adınız..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}