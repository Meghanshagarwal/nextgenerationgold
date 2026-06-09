import { NextResponse } from "next/server"
import { readProducts, writeProducts } from "@/lib/db"

export async function GET() {
  const products = await readProducts()
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const products = await readProducts()
    
    // simple validation
    if (!body.name || !body.collection || !body.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    
    // Check for duplicate slug
    if (products.some(p => p.slug === slug)) {
      return NextResponse.json({ error: "A product with this name or slug already exists" }, { status: 400 })
    }

    const newProduct = {
      slug,
      image: body.image || "/placeholder.svg",
      collection: body.collection,
      name: body.name,
      price: body.price,
      href: `/product/${slug}`,
      description: body.description || "",
      details: Array.isArray(body.details) ? body.details : (body.details ? body.details.split("\n").map((d: string) => d.trim()).filter(Boolean) : []),
      material: body.material || "",
      sku: body.sku || `NGG-${body.collection.substring(0,3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      featured: body.featured !== false
    }

    products.push(newProduct)
    await writeProducts(products)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
