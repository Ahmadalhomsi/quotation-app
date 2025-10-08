"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  searchableText?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | string[]
  onSelect?: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  multiple?: boolean
}

export function Combobox({
  options,
  value,
  onSelect,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
  multiple = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : []
  const selectedOption = multiple ? null : options.find((option) => option.value === value)
  
  const getDisplayText = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0])
        return option?.label || placeholder
      }
      return `${selectedValues.length} ürün seçildi`
    }
    return selectedOption ? selectedOption.label : placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {getDisplayText()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(value, search) => {
            // Custom filter for exact word matching (case-insensitive with Turkish support)
            if (!search) return 1
            
            const searchLower = search.toLocaleLowerCase('tr-TR').trim()
            const valueLower = value.toLocaleLowerCase('tr-TR')
            
            // Check if the search term appears as a complete word or substring
            if (valueLower.includes(searchLower)) {
              // Prioritize exact matches at the beginning
              if (valueLower.startsWith(searchLower)) {
                return 1
              }
              // Then matches that contain the word
              return 0.8
            }
            
            return 0
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = multiple 
                  ? selectedValues.includes(option.value)
                  : value === option.value
                // Use searchableText for filtering, but keep the actual ID for selection
                const searchValue = option.searchableText || option.label.toLocaleLowerCase('tr-TR')
                return (
                  <CommandItem
                    key={option.value}
                    value={searchValue}
                    disabled={false}
                    onSelect={() => {
                      if (multiple) {
                        const newValues = isSelected
                          ? selectedValues.filter(v => v !== option.value)
                          : [...selectedValues, option.value]
                        onSelect?.(newValues)
                        // Don't close dropdown in multiple mode
                      } else {
                        // Single selection mode
                        onSelect?.(option.value === value ? "" : option.value)
                        setOpen(false)
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {multiple && selectedValues.length > 0 && (
              <div className="p-2 border-t">
                <Button
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="w-full"
                >
                  Seçimi Tamamla ({selectedValues.length} ürün)
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}