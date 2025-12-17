import { Users, Plus, FileText } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Customer } from './customer-table'

interface CustomerStatsProps {
  customers: Customer[]
}

export function CustomerStats({ customers }: CustomerStatsProps) {
  // Calculate statistics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const customersThisMonth = customers.filter(customer => {
    const createdDate = new Date(customer.createdAt)
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
  }).length

  // Calculate total quotations
  const totalQuotations = customers.reduce((total, customer) => {
    return total + (customer._count?.quotations || 0)
  }, 0)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Müşteri
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customers.length}</div>
          <p className="text-xs text-muted-foreground">
            Sistemde kayıtlı
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Bu Ay Eklenen
          </CardTitle>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customersThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Yeni müşteri
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Teklifler
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQuotations}</div>
          <p className="text-xs text-muted-foreground">
            Oluşturulan teklif
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
