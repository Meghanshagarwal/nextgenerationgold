import { NextResponse } from "next/server"
import { readProducts, writeProducts, deleteProduct } from "@/lib/db"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await params
  const products = await readProducts()
  const product = products.find(p => p.slug === slug)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  return NextResponse.json(product)
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  try {
    const { slug } = await params
    const body = await req.json()
    let products = await readProducts()
    const index = products.findIndex(p => p.slug === slug)
    
    if (index === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const details = Array.isArray(body.details) 
      ? body.details 
      : (body.details ? body.details.split("\n").map((d: string) => d.trim()).filter(Boolean) : products[index].details)

    const updated = {
      ...products[index],
      ...body,
      details,
      // If slug changes, update the href accordingly
      href: body.slug ? `/product/${body.slug}` : products[index].href
    }

    products[index] = updated
    await writeProducts(products)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await params
  const success = await deleteProduct(slug)
  
  if (!success) {
    return NextResponse.json({ error: "Product not found or delete failed" }, { status: 404 })
  }

  return NextResponse.json({ message: "Product deleted" })
}
