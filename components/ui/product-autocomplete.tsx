"use client"

import * as React from "react"
import { Package, Plus } from "lucide-react"

import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Currency } from "@/lib/types"

interface Product {
  id: string
  name: string
  price: number
  currency: Currency
  description?: string
}

interface ProductAutocompleteProps {
  products: Product[]
  value?: string | string[]
  onSelect?: (productId: string | string[]) => void
  onCreateNew?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showCreateButton?: boolean
  error?: boolean
  multiple?: boolean
}

export function ProductAutocomplete({
  products,
  value,
  onSelect,
  onCreateNew,
  placeholder = "Ürün seçin...",
  className,
  disabled = false,
  showCreateButton = true,
  error = false,
  multiple = false,
}: ProductAutocompleteProps) {
  const options: ComboboxOption[] = products.map((product) => ({
    value: product.id,
    label: `${product.name} - ${product.price} ${product.currency}`,
    searchableText: `${product.name} ${product.description || ''}`.toLocaleLowerCase('tr-TR'),
  }))

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {showCreateButton && onCreateNew && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCreateNew}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Yeni Ürün
          </Button>
        )}
        <div className="flex-1">
          <Combobox
            options={options}
            value={value}
            onSelect={onSelect}
            placeholder={products.length === 0 ? "Ürün bulunamadı" : (multiple ? "Ürünleri seçin..." : placeholder)}
            searchPlaceholder="Ürün ara..."
            emptyText="Ürün bulunamadı"
            className={cn("w-full", error && "border-red-500", className)}
            disabled={disabled || products.length === 0}
            multiple={multiple}
          />
        </div>
      </div>
      {products.length === 0 && (
        <p className="text-sm text-amber-600 flex items-center gap-1">
          <Package className="h-4 w-4" />
          Veritabanında ürün bulunamadı. Yeni ürün ekleyebilirsiniz.
        </p>
      )}
    </div>
  )
}

// Optional: Product display component for showing selected product details
interface ProductDisplayProps {
  product: Product | null
  className?: string
}

export function ProductDisplay({ product, className }: ProductDisplayProps) {
  if (!product) return null

  return (
    <div className={cn("flex items-center gap-2 p-3 bg-muted/50 rounded-md", className)}>
      <Package className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{product.name}</p>
          <Badge variant="secondary">
            {product.price} {product.currency}
          </Badge>
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground truncate mt-1">
            {product.description}
          </p>
        )}
      </div>
    </div>
  )
}