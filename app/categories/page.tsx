"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
  prefix: string
  description: string | null
  color: string | null
  isActive: boolean
  nextNumber: number
  _count: {
    tickets: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    prefix: "",
    description: "",
    color: "#3B82F6"
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Category ${editingCategory ? 'updated' : 'created'} successfully`
        })
        
        setIsCreateDialogOpen(false)
        setEditingCategory(null)
        resetForm()
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      prefix: category.prefix,
      description: category.description || "",
      color: category.color || "#3B82F6"
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully"
        })
        fetchCategories()
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Category ${category.isActive ? 'deactivated' : 'activated'}`
        })
        fetchCategories()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      })
    }
  }

  const seedDefaultCategories = async () => {
    try {
      const response = await fetch('/api/categories/seed', {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message
        })
        fetchCategories()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed categories",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      prefix: "",
      description: "",
      color: "#3B82F6"
    })
  }

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false)
    setEditingCategory(null)
    resetForm()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage ticket categories and auto-numbering prefixes
          </p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Button onClick={seedDefaultCategories} variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Seed Defaults
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </DialogTitle>
                <DialogDescription>
                  Categories help organize tickets with automatic numbering (e.g., WEB-001)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Website Issues"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prefix">Prefix (2-4 letters)</Label>
                  <Input
                    id="prefix"
                    value={formData.prefix}
                    onChange={(e) => setFormData({...formData, prefix: e.target.value.toUpperCase()})}
                    placeholder="WEB"
                    maxLength={4}
                    pattern="[A-Z]{2,4}"
                    required
                    disabled={!!editingCategory}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Used for ticket numbers: {formData.prefix || 'PREFIX'}-001
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Issues related to website functionality"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="#3B82F6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first category to start organizing tickets with automatic numbering
            </p>
            <Button onClick={seedDefaultCategories}>
              <Tag className="mr-2 h-4 w-4" />
              Create Default Categories
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className={`${!category.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color || '#6B7280' }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.prefix}
                  </Badge>
                </div>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{category._count.tickets} tickets</span>
                  <span>Next: {category.prefix}-{String(category.nextNumber).padStart(3, '0')}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(category)}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  {category._count.tickets === 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{category.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
