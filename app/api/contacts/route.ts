import { NextResponse } from "next/server"
import { readContacts, writeContacts, ContactSubmission } from "@/lib/db"

export async function GET() {
  const contacts = await readContacts()
  return NextResponse.json(contacts)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const contacts = await readContacts()

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing required fields (name, email, message)" }, { status: 400 })
    }

    const newSubmission: ContactSubmission = {
      id: Math.random().toString(36).substring(2, 9),
      name: body.name,
      email: body.email,
      subject: body.subject || "Product Inquiry",
      message: body.message,
      productInterest: body.productInterest || "",
      createdAt: new Date().toISOString()
    }

    contacts.unshift(newSubmission) // Add to top of the list
    await writeContacts(contacts)
    return NextResponse.json(newSubmission, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
