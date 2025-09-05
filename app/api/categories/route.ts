import { NextResponse } from "next/server"
import { getActiveCategories, getAllCategories, createCategory } from "@/lib/categories"
import { createCategorySchema } from "@/lib/validation/settings"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const categories = includeInactive 
      ? await getAllCategories()
      : await getActiveCategories()
      
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const parsed = createCategorySchema.parse(data)
    
    const category = await createCategory(parsed)
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create category' }, 
      { status: 400 }
    )
  }
}
