import { NextResponse } from "next/server"
import { readTags, addTag } from "@/lib/db"

export async function GET() {
  const tags = await readTags()
  return NextResponse.json(tags)
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newTag = await addTag(name)
    if (!newTag) {
      return NextResponse.json({ error: "Failed to create tag" }, { status: 500 })
    }

    return NextResponse.json(newTag, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
