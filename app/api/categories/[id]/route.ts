import { NextResponse } from "next/server"
import { updateCategory, deleteCategory } from "@/lib/categories"
import { updateCategorySchema } from "@/lib/validation/settings"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const parsed = updateCategorySchema.parse(data)
    
    const category = await updateCategory(params.id, parsed)
    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update category' }, 
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCategory(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' }, 
      { status: 400 }
    )
  }
}
