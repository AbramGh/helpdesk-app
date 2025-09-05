import { prisma } from './prisma'

// Generate next ticket number for a category
export async function generateTicketNumber(categoryId: string): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  })
  
  if (!category) {
    throw new Error('Category not found')
  }

  // Update the counter atomically
  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: { nextNumber: { increment: 1 } }
  })

  // Format: PREFIX-001, PREFIX-002, etc.
  const paddedNumber = String(updatedCategory.nextNumber).padStart(3, '0')
  return `${category.prefix}-${paddedNumber}`
}

// Generate ticket number without category (fallback)
export async function generateGenericTicketNumber(): Promise<string> {
  // Find or create a default "GEN" category
  let defaultCategory = await prisma.category.findUnique({
    where: { prefix: 'GEN' }
  })

  if (!defaultCategory) {
    defaultCategory = await prisma.category.create({
      data: {
        name: 'General',
        prefix: 'GEN',
        description: 'General support requests',
        color: '#6B7280',
        nextNumber: 1
      }
    })
  }

  return generateTicketNumber(defaultCategory.id)
}

// Create a new category
export async function createCategory(data: {
  name: string
  prefix: string
  description?: string
  color?: string
}) {
  // Validate prefix (uppercase, 2-4 characters)
  const prefix = data.prefix.toUpperCase()
  if (!/^[A-Z]{2,4}$/.test(prefix)) {
    throw new Error('Prefix must be 2-4 uppercase letters')
  }

  // Check if prefix already exists
  const existingCategory = await prisma.category.findUnique({
    where: { prefix }
  })

  if (existingCategory) {
    throw new Error('Prefix already exists')
  }

  return await prisma.category.create({
    data: {
      ...data,
      prefix,
      nextNumber: 1
    }
  })
}

// Get all active categories
export async function getActiveCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { tickets: true }
      }
    }
  })
}

// Get all categories (including inactive)
export async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { tickets: true }
      }
    }
  })
}

// Update category
export async function updateCategory(id: string, data: {
  name?: string
  description?: string
  color?: string
  isActive?: boolean
}) {
  return await prisma.category.update({
    where: { id },
    data
  })
}

// Delete category (only if no tickets)
export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { tickets: true }
      }
    }
  })

  if (!category) {
    throw new Error('Category not found')
  }

  if (category._count.tickets > 0) {
    throw new Error('Cannot delete category with existing tickets')
  }

  return await prisma.category.delete({
    where: { id }
  })
}

// Seed default categories
export async function seedDefaultCategories() {
  const defaultCategories = [
    { name: "Website", prefix: "WEB", description: "Website issues and requests", color: "#3B82F6" },
    { name: "Software", prefix: "SOF", description: "Software bugs and features", color: "#10B981" },
    { name: "Hardware", prefix: "HWR", description: "Hardware problems", color: "#F59E0B" },
    { name: "General", prefix: "GEN", description: "General support requests", color: "#6B7280" },
    { name: "Urgent", prefix: "URG", description: "Urgent issues", color: "#EF4444" }
  ]

  const results = []
  for (const category of defaultCategories) {
    try {
      const existing = await prisma.category.findUnique({
        where: { prefix: category.prefix }
      })
      
      if (!existing) {
        const created = await createCategory(category)
        results.push(created)
      }
    } catch (error) {
      console.log(`Skipping ${category.name}: already exists`)
    }
  }

  return results
}
