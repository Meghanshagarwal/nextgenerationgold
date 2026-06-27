import { NextResponse } from "next/server"
import { deleteTag } from "@/lib/db"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await params
  const success = await deleteTag(id)

  if (!success) {
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 400 })
  }

  return NextResponse.json({ message: "Tag deleted successfully" })
}
