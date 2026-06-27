import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const defaults = {
  hero: {
    image: "/images/hero.png",
    title: "With Love, Since 1837",
    description: "Discover the icons that have defined a legacy of extraordinary design.",
    buttonText: "Explore the Collection",
    buttonLink: "/category/jewelry"
  },
  categories: [
    { title: "Jewelry", image: "/images/cat-jewelry.png", href: "/category/jewelry" },
    { title: "Love & Engagement", image: "/images/cat-engagement.png", href: "/category/love-engagement" },
    { title: "Gifts", image: "/images/cat-gifts.png", href: "/category/gifts" }
  ],
  editorial1: {
    eyebrow: "Timepieces",
    title: "The Art of Time",
    description: "Masterfully crafted watches that blend precision engineering with timeless elegance, designed to be cherished for generations.",
    image: "/images/editorial-watch.png"
  },
  editorial2: {
    eyebrow: "Love & Engagement",
    title: "A Promise Made to Last",
    description: "From the first spark to forever, celebrate your story with rings as extraordinary as your love. Each one a testament to enduring craftsmanship.",
    image: "/images/editorial-love.png"
  },
  world: {
    image: "/images/world-ngg.png",
    title: "A Legacy of Brilliance",
    subtitle: "The World of NGG",
    buttonText: "Explore Our Story",
    buttonLink: "/about-us"
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json(defaults)

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "home_page")
      .single()

    if (error) {
      if (error.code !== "PGRST116" && error.code !== "42P01") {
        console.warn("[home-page GET] Supabase error:", error.code, error.message)
      }
      return NextResponse.json(defaults)
    }

    if (data?.value) {
      // Merge with defaults to ensure all keys exist
      const merged = {
        ...defaults,
        ...data.value,
        hero: { ...defaults.hero, ...(data.value.hero || {}) },
        editorial1: { ...defaults.editorial1, ...(data.value.editorial1 || {}) },
        editorial2: { ...defaults.editorial2, ...(data.value.editorial2 || {}) },
        world: { ...defaults.world, ...(data.value.world || {}) }
      }
      return NextResponse.json(merged)
    }
  } catch (e) {
    console.warn("[home-page GET] Supabase threw:", e)
  }

  return NextResponse.json(defaults)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = getSupabase()
    
    if (!supabase) {
      console.warn("[home-page POST] No Supabase env vars — settings NOT persisted")
      return NextResponse.json(body)
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "home_page", value: body, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      console.error("[home-page POST] Supabase upsert failed:", error.code, error.message)
      return NextResponse.json(
        { error: `Supabase error (${error.code}): ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(body)
  } catch (error: any) {
    console.error("[home-page POST] Unexpected error:", error)
    return NextResponse.json(
      { error: "Server error: " + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
