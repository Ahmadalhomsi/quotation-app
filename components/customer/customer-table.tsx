import Link from 'next/link'
import { 
  Edit,
  Trash2,
  Eye,
  Building,
  Mail,
  Phone,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Types
export interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  address: string | null
  taxNumber: string | null
  taxOffice: string | null
  priority: number
  source: string | null
  notes: string | null
  lastContact: string | null
  nextContact: string | null
  customerTypes?: Array<{
    id: string
    typeId: string
    type: {
      id: string
      name: string
      color: string
      category?: string
      description?: string
    }
  }>
  _count?: {
    quotations: number
  }
  createdAt: string
  updatedAt: string
}

export type SortField = 'companyName' | 'contactName' | 'email' | 'phone' | 'priority' | 'quotations' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

interface CustomerTableProps {
  customers: Customer[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onDelete: (customerId: string) => void
}

const SortButton = ({ 
  field, 
  sortField, 
  sortDirection, 
  onSort, 
  children 
}: { 
  field: SortField
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  children: React.ReactNode 
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-auto p-0 font-medium hover:bg-transparent"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </div>
  </Button>
)

export function CustomerTable({ 
  customers, 
  sortField, 
  sortDirection, 
  onSort, 
  onDelete 
}: CustomerTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">
            <SortButton field="companyName" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
              Şirket / İletişim
            </SortButton>
          </TableHead>
          <TableHead className="w-[180px]">
            <SortButton field="email" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
              İletişim Bilgileri
            </SortButton>
          </TableHead>
          <TableHead className="w-[220px]">
            <SortButton field="priority" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
              Müşteri Tipleri & Öncelik
            </SortButton>
          </TableHead>
          <TableHead className="w-[100px]">
            <SortButton field="quotations" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
              <div className="flex items-center justify-center gap-1">
                <FileText className="h-4 w-4" />
                Teklifler
              </div>
            </SortButton>
          </TableHead>
          <TableHead className="w-[120px]">
            <SortButton field="createdAt" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>
              Kayıt Tarihi
            </SortButton>
          </TableHead>
          <TableHead className="text-right w-[120px]">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{customer.companyName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.contactName}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{customer.email || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span>{customer.phone || 'Belirtilmemiş'}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                {/* Priority */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground min-w-[45px]">Öncelik:</span>
                  <Badge 
                    variant={customer.priority === 3 ? 'destructive' : customer.priority === 2 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {customer.priority === 3 ? 'Yüksek' : customer.priority === 2 ? 'Orta' : 'Düşük'}
                  </Badge>
                </div>
                
                {/* Customer Types */}
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground">Tipler:</span>
                  </div>
                  {customer.customerTypes && customer.customerTypes.length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(
                        customer.customerTypes.reduce((acc, customerType) => {
                          const category = customerType.type.category || 'custom'
                          if (!acc[category]) {
                            acc[category] = []
                          }
                          acc[category].push(customerType)
                          return acc
                        }, {} as Record<string, typeof customer.customerTypes>)
                      ).map(([category, types]) => (
                        <div key={category} className="flex flex-wrap gap-1">
                          {types.map((customerType) => (
                            <Badge 
                              key={customerType.id}
                              variant="outline" 
                              className="text-xs px-2 py-0.5 cursor-pointer hover:opacity-80"
                              style={{ 
                                backgroundColor: customerType.type.color + '15',
                                borderColor: customerType.type.color + '50',
                                color: customerType.type.color
                              }}
                              title={`${customerType.type.name}${customerType.type.description ? ` - ${customerType.type.description}` : ''}`}
                            >
                              {customerType.type.name}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Tip Belirtilmemiş
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center">
                {customer._count?.quotations ? (
                  <Badge variant="default" className="text-xs">
                    {customer._count.quotations} Teklif
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Teklif Yok
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-sm">
              {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/musteriler/${customer.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/musteriler/${customer.id}/duzenle`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-800"
                  onClick={() => onDelete(customer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
