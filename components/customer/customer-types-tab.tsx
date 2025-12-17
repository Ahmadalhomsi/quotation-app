import { Tags, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateCustomerTypeModal } from '@/components/modals/create-customer-type-modal'
import { CustomerType } from '@/lib/types'

interface CustomerTypesTabProps {
  customerTypes: CustomerType[]
  isLoading: boolean
  onTypeCreated: (newType: CustomerType) => void
  onTypeDeleted: (typeId: string) => void
}

export function CustomerTypesTab({ 
  customerTypes, 
  isLoading, 
  onTypeCreated,
  onTypeDeleted 
}: CustomerTypesTabProps) {
  const handleDeleteCustomerType = async (typeId: string) => {
    try {
      const response = await fetch(`/api/customer-types/${typeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Müşteri tipi silinemedi')
      }

      onTypeDeleted(typeId)
      toast.success('Müşteri tipi başarıyla silindi')
    } catch (error) {
      console.error('Müşteri tipi silme hatası:', error)
      toast.error(error instanceof Error ? error.message : 'Müşteri tipi silinirken bir hata oluştu')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Müşteri Tipleri</CardTitle>
          <CardDescription>Müşteri tiplerini görüntüleyin ve yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Müşteri tipleri yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (customerTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Müşteri Tipleri</CardTitle>
          <CardDescription>Müşteri tiplerini görüntüleyin ve yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Tags className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Henüz müşteri tipi eklenmemiş</h3>
            <p className="text-muted-foreground mb-4">
              İlk müşteri tipinizi oluşturun
            </p>
            <CreateCustomerTypeModal onTypeCreated={onTypeCreated} />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Müşteri Tipleri</CardTitle>
        <CardDescription>Müşteri tiplerini görüntüleyin ve yönetin</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Types by Category */}
          {Object.entries(
            customerTypes.reduce((acc, type) => {
              const category = type.category || 'custom'
              if (!acc[category]) {
                acc[category] = []
              }
              acc[category].push(type)
              return acc
            }, {} as Record<string, CustomerType[]>)
          ).map(([category, types]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {category === 'status' && 'Durum'}
                {category === 'priority' && 'Öncelik'}
                {category === 'source' && 'Kaynak'}
                {category === 'behavior' && 'Davranış'}
                {category === 'custom' && 'Özel'}
              </h4>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {types.map((type) => (
                  <Card key={type.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        <div>
                          <p className="font-medium text-sm">{type.name}</p>
                          {type.description && (
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteCustomerType(type.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
