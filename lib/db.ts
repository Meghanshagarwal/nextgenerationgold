import { createClient } from "@supabase/supabase-js"
import { products as defaultProducts, Product } from "./products"

let supabaseClient: any = null

function getSupabase() {
  if (supabaseClient) return supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
    },
  })
  return supabaseClient
}

// Helper to seed products if table is empty
async function seedProductsIfNeeded() {
  const supabase = getSupabase()
  if (!supabase) return

  try {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error checking products count for seeding:", error)
      return
    }

    if (count === 0) {
      console.log("Database is empty, seeding default products...")
      const itemsToInsert = defaultProducts.map((p) => ({
        slug: p.slug,
        image: p.image,
        collection: p.collection,
        name: p.name,
        price: p.price,
        href: p.href,
        description: p.description,
        details: p.details,
        material: p.material,
        sku: p.sku,
        featured: p.featured !== false,
      }))

      const { error: insertError } = await supabase
        .from("products")
        .insert(itemsToInsert)

      if (insertError) {
        console.error("Error seeding default products:", insertError)
      } else {
        console.log("Default products seeded successfully!")
      }
    }
  } catch (e) {
    console.error("Failed to seed database:", e)
  }
}

export function mapRowToProduct(row: any): Product {
  return {
    slug: row.slug,
    image: row.image,
    collection: row.collection,
    name: row.name,
    price: row.price,
    href: row.href,
    description: row.description,
    details: row.details || [],
    material: row.material,
    sku: row.sku,
    featured: row.featured !== false,
    category: row.category || undefined,
    productType: row.product_type || undefined,
    shortDescription: row.short_description || undefined,
    styling: row.styling || undefined,
    occasions: row.occasions || undefined,
    metalType: row.metal_type || undefined,
    goldPurity: row.gold_purity || undefined,
    goldColor: row.gold_color || undefined,
    grossWeight: row.gross_weight || undefined,
    netGoldWeight: row.net_gold_weight || undefined,
    diamondType: row.diamond_type || undefined,
    totalDiamondWeight: row.total_diamond_weight || undefined,
    diamondShape: row.diamond_shape || undefined,
    diamondColor: row.diamond_color || undefined,
    diamondClarity: row.diamond_clarity || undefined,
    numberOfDiamonds: row.number_of_diamonds || undefined,
    gemstoneType: row.gemstone_type || undefined,
    gemstoneShape: row.gemstone_shape || undefined,
    gemstoneSize: row.gemstone_size || undefined,
    totalGemstoneWeight: row.total_gemstone_weight || undefined,
    numberOfGemstones: row.number_of_gemstones || undefined,
    origin: row.origin || undefined,
    treatment: row.treatment || undefined,
    dimensions: row.dimensions || undefined,
    ringSize: row.ring_size || undefined,
    necklaceLength: row.necklace_length || undefined,
    stockStatus: row.stock_status || undefined,
    productionTime: row.production_time || undefined,
    certification: row.certification || undefined,
    hallmarkDetails: row.hallmark_details || undefined,
    shippingInfo: row.shipping_info || undefined,
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
    tags: row.tags || []
  }
}

export function mapProductToRow(p: Product) {
  return {
    slug: p.slug,
    image: p.image,
    collection: p.collection,
    name: p.name,
    price: p.price,
    href: p.href,
    description: p.description,
    details: p.details || [],
    material: p.material,
    sku: p.sku,
    featured: p.featured !== false,
    category: p.category || null,
    product_type: p.productType || null,
    short_description: p.shortDescription || null,
    styling: p.styling || null,
    occasions: p.occasions || null,
    metal_type: p.metalType || null,
    gold_purity: p.goldPurity || null,
    gold_color: p.goldColor || null,
    gross_weight: p.grossWeight || null,
    net_gold_weight: p.netGoldWeight || null,
    diamond_type: p.diamondType || null,
    total_diamond_weight: p.totalDiamondWeight || null,
    diamond_shape: p.diamondShape || null,
    diamond_color: p.diamondColor || null,
    diamond_clarity: p.diamondClarity || null,
    number_of_diamonds: p.numberOfDiamonds !== undefined && p.numberOfDiamonds !== "" ? Number(p.numberOfDiamonds) : null,
    gemstone_type: p.gemstoneType || null,
    gemstone_shape: p.gemstoneShape || null,
    gemstone_size: p.gemstoneSize || null,
    total_gemstone_weight: p.totalGemstoneWeight || null,
    number_of_gemstones: p.numberOfGemstones !== undefined && p.numberOfGemstones !== "" ? Number(p.numberOfGemstones) : null,
    origin: p.origin || null,
    treatment: p.treatment || null,
    dimensions: p.dimensions || null,
    ring_size: p.ringSize || null,
    necklace_length: p.necklaceLength || null,
    stock_status: p.stockStatus || null,
    production_time: p.productionTime || null,
    certification: p.certification || null,
    hallmark_details: p.hallmarkDetails || null,
    shipping_info: p.shippingInfo || null,
    seo_title: p.seoTitle || null,
    seo_description: p.seoDescription || null,
    tags: p.tags || []
  }
}

export async function readProducts(): Promise<Product[]> {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn("Supabase env variables missing or client not initialized. Falling back to default products.")
    return defaultProducts
  }

  // Trigger seeding check
  await seedProductsIfNeeded()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error reading products from Supabase:", error)
    return defaultProducts
  }

  return (data || []).map(mapRowToProduct)
}

export async function writeProducts(products: Product[]) {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn("Supabase env variables missing. Cannot write.")
    return
  }

  const items = products.map(mapProductToRow)

  const { error } = await supabase.from("products").upsert(items, { onConflict: "slug" })

  if (error) {
    console.error("Error writing products to Supabase:", error)
  }
}

export type Category = {
  id: string | number
  name: string
  slug: string
}

export type Tag = {
  id: string | number
  name: string
  slug: string
}

export async function readCategories(): Promise<Category[]> {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn("Supabase env missing. Falling back to default categories.")
    return [
      { id: 1, name: "Signature Collection", slug: "signature-collection" },
      { id: 2, name: "HardWear", slug: "hardwear" },
      { id: 3, name: "Smile", slug: "smile" },
      { id: 4, name: "T1", slug: "t1" },
      { id: 5, name: "Lock", slug: "lock" },
      { id: 6, name: "High Jewelry", slug: "high-jewelry" }
    ]
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error reading categories from Supabase:", error)
    return []
  }

  return data || []
}

export async function addCategory(name: string): Promise<Category | null> {
  const supabase = getSupabase()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  if (!supabase) {
    return { id: Date.now(), name, slug }
  }

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, slug }])
    .select()

  if (error) {
    console.error("Error adding category:", error)
    return null
  }

  return data?.[0] || null
}

export async function deleteCategory(id: any): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return true

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    return false
  }

  return true
}

export async function readTags(): Promise<Tag[]> {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn("Supabase env missing. Falling back to default tags.")
    return [
      { id: 1, name: "Gold", slug: "gold" },
      { id: 2, name: "Diamond", slug: "diamond" },
      { id: 3, name: "Rose Gold", slug: "rose-gold" },
      { id: 4, name: "White Gold", slug: "white-gold" },
      { id: 5, name: "Yellow Gold", slug: "yellow-gold" },
      { id: 6, name: "Pendant", slug: "pendant" },
      { id: 7, name: "Bracelet", slug: "bracelet" },
      { id: 8, name: "Necklace", slug: "necklace" },
      { id: 9, name: "Ring", slug: "ring" }
    ]
  }

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error reading tags from Supabase:", error)
    return []
  }

  return data || []
}

export async function addTag(name: string): Promise<Tag | null> {
  const supabase = getSupabase()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  if (!supabase) {
    return { id: Date.now(), name, slug }
  }

  const { data, error } = await supabase
    .from("tags")
    .insert([{ name, slug }])
    .select()

  if (error) {
    console.error("Error adding tag:", error)
    return null
  }

  return data?.[0] || null
}

export async function deleteTag(id: any): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return true

  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting tag:", error)
    return false
  }

  return true
}

export async function deleteProduct(slug: string): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn("Supabase env variables missing. Cannot delete.")
    return false
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("slug", slug)

  if (error) {
    console.error("Error deleting product from Supabase:", error)
    return false
  }

  return true
}

export type ContactSubmission = {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  productInterest?: string
  createdAt: string
}

export async function readContacts(): Promise<ContactSubmission[]> {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn("Supabase env variables missing. Returning empty contacts.")
    return []
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error reading contacts from Supabase:", error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject || undefined,
    message: row.message,
    productInterest: row.product_interest || undefined,
    createdAt: row.created_at,
  }))
}

export async function writeContacts(contacts: ContactSubmission[]) {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn("Supabase env variables missing. Cannot write contacts.")
    return
  }

  const items = contacts.map((c) => ({
    id: c.id && c.id.length > 10 ? c.id : undefined, // skip client generated temp ids to let postgres auto-generate uuid
    name: c.name,
    email: c.email,
    subject: c.subject || null,
    message: c.message,
    product_interest: c.productInterest || null,
    created_at: c.createdAt || new Date().toISOString(),
  }))

  const { error } = await supabase.from("contacts").upsert(items, { onConflict: "id" })

  if (error) {
    console.error("Error writing contacts to Supabase:", error)
  }
}
