import { NextResponse } from "next/server"
import { readProducts, writeProducts } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const products = readProducts()
  const product = products.find(p => p.slug === params.slug)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  return NextResponse.json(product)
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json()
    let products = readProducts()
    const index = products.findIndex(p => p.slug === params.slug)
    
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
    writeProducts(products)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  let products = readProducts()
  const index = products.findIndex(p => p.slug === params.slug)
  
  if (index === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const deleted = products.splice(index, 1)
  writeProducts(products)
  return NextResponse.json({ message: "Product deleted", product: deleted[0] })
}
