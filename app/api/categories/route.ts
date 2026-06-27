import { NextResponse } from "next/server"
import { readCategories, addCategory } from "@/lib/db"

export async function GET() {
  const categories = await readCategories()
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newCategory = await addCategory(name)
    if (!newCategory) {
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
