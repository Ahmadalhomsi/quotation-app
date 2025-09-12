'use client'

import Link from 'next/link'
import { 
  FileText, 
  Package, 
  Users, 
  TrendingUp,
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

const stats = [
  {
    title: 'Toplam Teklifler',
    value: '0',
    description: 'Bu ay oluşturulan',
    icon: FileText
  },
  {
    title: 'Aktif Ürünler',
    value: '0',
    description: 'Katalog\'da mevcut',
    icon: Package
  },
  {
    title: 'Kayıtlı Müşteriler',
    value: '0',
    description: 'Sistemde kayıtlı',
    icon: Users
  },
  {
    title: 'Güncel Döviz Kuru',
    value: '₺--',
    description: 'USD/TL kuru',
    icon: DollarSign
  }
]

export default function HomePage() {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
            <div className="text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Henüz teklif bulunmuyor.</p>
              <p className="text-sm">İlk teklifinizi oluşturmak için yukarıdaki düğmeyi kullanın.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}