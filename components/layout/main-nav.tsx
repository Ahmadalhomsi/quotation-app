'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Package, 
  Users, 
  FileText, 
  Menu,
  DollarSign,
  Settings
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const navigation = [
  {
    name: 'Ana Sayfa',
    href: '/',
    icon: FileText
  },
  {
    name: 'Teklifler',
    href: '/teklifler',
    icon: FileText
  },
  {
    name: 'Ürünler',
    href: '/urunler',
    icon: Package
  },
  {
    name: 'Müşteriler',
    href: '/musteriler',
    icon: Users
  }
]

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">M</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              MAPOS Teklif Sistemi
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === item.href 
                    ? 'text-foreground font-medium' 
                    : 'text-foreground/60'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menüyü aç</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link
                className="flex items-center space-x-2"
                href="/"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">M</span>
                </div>
                <span className="font-bold">MAPOS</span>
              </Link>
            </div>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <nav className="flex flex-col space-y-3">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 text-sm font-medium transition-colors hover:text-foreground/80 ${
                        pathname === item.href 
                          ? 'text-foreground' 
                          : 'text-foreground/60'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link className="flex items-center space-x-2 md:hidden" href="/">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">M</span>
              </div>
              <span className="font-bold">MAPOS</span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}