"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name: string
  prefix: string
  color: string | null
}

interface CategorySelectorProps {
  value?: string
  onValueChange: (value: string | undefined) => void
  placeholder?: string
  className?: string
}

export function CategorySelector({ 
  value, 
  onValueChange, 
  placeholder = "Select category...",
  className 
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = categories.find(category => category.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedCategory.color || '#6B7280' }}
              />
              <span>{selectedCategory.name}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedCategory.prefix}
              </Badge>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandEmpty>
            {loading ? "Loading categories..." : "No categories found."}
          </CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                onValueChange(undefined)
                setOpen(false)
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !value ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-muted-foreground">No category</span>
            </CommandItem>
            {categories.map((category) => (
              <CommandItem
                key={category.id}
                onSelect={() => {
                  onValueChange(category.id === value ? undefined : category.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === category.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color || '#6B7280' }}
                  />
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.prefix}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
