import { NextResponse } from "next/server"
import { seedDefaultCategories } from "@/lib/categories"

export async function POST() {
  try {
    const categories = await seedDefaultCategories()
    return NextResponse.json({ 
      message: `Created ${categories.length} default categories`,
      categories 
    })
  } catch (error: any) {
    console.error('Failed to seed categories:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to seed categories' }, 
      { status: 500 }
    )
  }
}
