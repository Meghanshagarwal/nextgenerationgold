import { NextResponse } from "next/server"
import { deleteCategory } from "@/lib/db"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await params
  const success = await deleteCategory(id)

  if (!success) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 400 })
  }

  return NextResponse.json({ message: "Category deleted successfully" })
}
