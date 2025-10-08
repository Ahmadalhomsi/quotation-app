"use client"

import * as React from "react"
import { Building2, Plus, User } from "lucide-react"

import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  companyName: string
  contactName: string
  email?: string
}

interface CustomerAutocompleteProps {
  customers: Customer[]
  value?: string
  onSelect?: (customerId: string) => void
  onCreateNew?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showCreateButton?: boolean
  error?: boolean
}

export function CustomerAutocomplete({
  customers,
  value,
  onSelect,
  onCreateNew,
  placeholder = "Müşteri seçin...",
  className,
  disabled = false,
  showCreateButton = true,
  error = false,
}: CustomerAutocompleteProps) {
  const options: ComboboxOption[] = customers.map((customer) => ({
    value: customer.id,
    label: customer.companyName,
    searchableText: `${customer.companyName} ${customer.contactName} ${customer.email || ''}`.toLocaleLowerCase('tr-TR'),
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
            Yeni Müşteri
          </Button>
        )}
        <div className="flex-1">
          <Combobox
            options={options}
            value={value}
            onSelect={onSelect}
            placeholder={customers.length === 0 ? "Müşteri bulunamadı" : placeholder}
            searchPlaceholder="Müşteri ara..."
            emptyText="Müşteri bulunamadı"
            className={cn("w-full", error && "border-red-500", className)}
            disabled={disabled || customers.length === 0}
          />
        </div>
      </div>
      {customers.length === 0 && (
        <p className="text-sm text-amber-600 flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          Veritabanında müşteri bulunamadı. Yeni müşteri ekleyebilirsiniz.
        </p>
      )}
    </div>
  )
}

// Optional: Customer display component for showing selected customer details
interface CustomerDisplayProps {
  customer: Customer | null
  className?: string
}

export function CustomerDisplay({ customer, className }: CustomerDisplayProps) {
  if (!customer) return null

  return (
    <div className={cn("flex items-center gap-2 p-3 bg-muted/50 rounded-md", className)}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{customer.companyName}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {customer.contactName}
          </span>
          {customer.email && (
            <span className="truncate">{customer.email}</span>
          )}
        </div>
      </div>
    </div>
  )
}