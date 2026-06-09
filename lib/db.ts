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

  return (data || []).map((row: any) => ({
    slug: row.slug,
    image: row.image,
    collection: row.collection,
    name: row.name,
    price: row.price,
    href: row.href,
    description: row.description,
    details: row.details,
    material: row.material,
    sku: row.sku,
    featured: row.featured !== false,
  }))
}

export async function writeProducts(products: Product[]) {
  const supabase = getSupabase()
  if (!supabase) {
    console.warn("Supabase env variables missing. Cannot write.")
    return
  }

  const items = products.map((p) => ({
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

  const { error } = await supabase.from("products").upsert(items, { onConflict: "slug" })

  if (error) {
    console.error("Error writing products to Supabase:", error)
  }
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
