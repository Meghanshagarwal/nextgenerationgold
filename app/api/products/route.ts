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
      image: body.image || "/images/prod-bracelet-yellow.png",
      collection: body.collection,
      name: body.name,
      price: body.price,
      href: `/product/${slug}`,
      description: body.description || "",
      details: Array.isArray(body.details) ? body.details : (body.details ? body.details.split("\n").map((d: string) => d.trim()).filter(Boolean) : []),
      material: body.material || "",
      sku: body.sku || `NGG-${body.collection.substring(0,3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      featured: body.featured !== false,
      
      // Jewelry specific fields
      category: body.category || "",
      productType: body.productType || "",
      shortDescription: body.shortDescription || "",
      styling: body.styling || "",
      occasions: body.occasions || "",
      metalType: body.metalType || "",
      goldPurity: body.goldPurity || "",
      goldColor: body.goldColor || "",
      grossWeight: body.grossWeight || "",
      netGoldWeight: body.netGoldWeight || "",
      diamondType: body.diamondType || "",
      totalDiamondWeight: body.totalDiamondWeight || "",
      diamondShape: body.diamondShape || "",
      diamondColor: body.diamondColor || "",
      diamondClarity: body.diamondClarity || "",
      numberOfDiamonds: body.numberOfDiamonds !== undefined ? body.numberOfDiamonds : "",
      gemstoneType: body.gemstoneType || "",
      gemstoneShape: body.gemstoneShape || "",
      gemstoneSize: body.gemstoneSize || "",
      totalGemstoneWeight: body.totalGemstoneWeight || "",
      numberOfGemstones: body.numberOfGemstones !== undefined ? body.numberOfGemstones : "",
      origin: body.origin || "",
      treatment: body.treatment || "",
      dimensions: body.dimensions || "",
      ringSize: body.ringSize || "",
      necklaceLength: body.necklaceLength || "",
      stockStatus: body.stockStatus || "In Stock",
      productionTime: body.productionTime || "",
      certification: body.certification || "",
      hallmarkDetails: body.hallmarkDetails || "",
      shippingInfo: body.shippingInfo || "",
      seoTitle: body.seoTitle || "",
      seoDescription: body.seoDescription || "",
      tags: Array.isArray(body.tags) ? body.tags : []
    }

    products.push(newProduct)
    await writeProducts(products)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
