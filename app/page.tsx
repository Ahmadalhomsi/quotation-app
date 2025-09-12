'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Package, 
  Users, 
  Plus,
  DollarSign
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface DashboardStats {
  totalQuotations: number
  activeProducts: number
  totalCustomers: number
  monthlyQuotations: number
  exchangeRate: number
}

interface RecentQuotation {
  id: string
  quotationNumber: string
  title: string
  customer: {
    companyName: string
  }
  status: string
  createdAt: string
}

const quickActions = [
  {
    title: 'Yeni Teklif Oluştur',
    description: 'Müşterileriniz için yeni teklif hazırlayın',
    href: '/teklifler/yeni',
    icon: FileText,
    color: 'bg-blue-500'
  },
  {
    title: 'Ürün Ekle',
    description: 'Katalog\'unuza yeni ürün ekleyin',
    href: '/urunler/yeni',
    icon: Package,
    color: 'bg-green-500'
  },
  {
    title: 'Müşteri Ekle',
    description: 'Yeni müşteri kaydı oluşturun',
    href: '/musteriler/yeni',
    icon: Users,
    color: 'bg-purple-500'
  }
]

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentQuotations, setRecentQuotations] = useState<RecentQuotation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.stats)
        }

        // Fetch recent quotations
        const quotationsResponse = await fetch('/api/quotations?limit=5')
        if (quotationsResponse.ok) {
          const quotationsData = await quotationsResponse.json()
          setRecentQuotations(quotationsData.quotations.slice(0, 5))
        }
      } catch (error) {
        console.error('Dashboard verileri alınırken hata:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statsCards = [
    {
      title: 'Toplam Teklifler',
      value: stats?.totalQuotations?.toString() || '0',
      description: 'Sistemde kayıtlı',
      icon: FileText
    },
    {
      title: 'Bu Ay',
      value: stats?.monthlyQuotations?.toString() || '0',
      description: 'Bu ay oluşturulan',
      icon: FileText
    },
    {
      title: 'Aktif Ürünler',
      value: stats?.activeProducts?.toString() || '0',
      description: 'Katalog\'da mevcut',
      icon: Package
    },
    {
      title: 'Kayıtlı Müşteriler',
      value: stats?.totalCustomers?.toString() || '0',
      description: 'Sistemde kayıtlı',
      icon: Users
    },
    {
      title: 'Güncel Döviz Kuru',
      value: stats?.exchangeRate ? `₺${stats.exchangeRate.toFixed(2)}` : '₺--',
      description: 'USD/TL kuru',
      icon: DollarSign
    }
  ]
  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          MAPOS Teklif Yönetim Sistemi
        </h1>
        <p className="text-muted-foreground">
          POS sistemleri için kapsamlı teklif yönetimi
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Hızlı İşlemler */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Hızlı İşlemler
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={action.href}>
                      <Plus className="mr-2 h-4 w-4" />
                      Başlat
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Son Teklifler */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Son Teklifler
          </h2>
          <Button variant="outline" asChild>
            <Link href="/teklifler">
              Tümünü Gör
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Yükleniyor...</p>
              </div>
            ) : recentQuotations.length > 0 ? (
              <div className="space-y-4">
                {recentQuotations.map((quotation) => (
                  <div key={quotation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{quotation.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {quotation.customer.companyName} • {quotation.quotationNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        quotation.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                        quotation.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                        quotation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        quotation.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quotation.status === 'DRAFT' ? 'Taslak' :
                         quotation.status === 'SENT' ? 'Gönderildi' :
                         quotation.status === 'ACCEPTED' ? 'Kabul Edildi' :
                         quotation.status === 'REJECTED' ? 'Reddedildi' :
                         quotation.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(quotation.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Henüz teklif bulunmuyor.</p>
                <p className="text-sm">İlk teklifinizi oluşturmak için yukarıdaki düğmeyi kullanın.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}