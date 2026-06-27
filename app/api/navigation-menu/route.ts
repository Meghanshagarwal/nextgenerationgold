import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const defaults = [
  { id: 1, name: "HIGH JEWELRY", href: "/category/high-jewelry" },
  { id: 2, name: "JEWELRY", href: "/category/jewelry" },
  { id: 3, name: "LOVE & ENGAGEMENT", href: "/category/love-engagement" },
  { id: 4, name: "WATCHES", href: "/category/watches" },
  { id: 5, name: "HOME", href: "/category/home" },
  { id: 6, name: "ACCESSORIES", href: "/category/accessories" },
  { id: 7, name: "ABOUT US", href: "/about-us" }
]

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  const supabase = getSupabase()

  if (!supabase) {
    return NextResponse.json(defaults)
  }

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "navigation_menu")
      .single()

    if (error) {
      if (error.code !== "PGRST116" && error.code !== "42P01") {
        console.warn("[navigation-menu GET] Supabase error:", error.code, error.message)
      }
      return NextResponse.json(defaults)
    }

    if (data?.value) {
      return NextResponse.json(data.value)
    }
  } catch (e) {
    console.warn("[navigation-menu GET] Supabase threw:", e)
  }

  return NextResponse.json(defaults)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Body should be an array of navigation items
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Payload must be a JSON array of navigation items" }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      console.warn("[navigation-menu POST] No Supabase env vars — settings NOT persisted")
      return NextResponse.json(body)
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "navigation_menu", value: body, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      console.error("[navigation-menu POST] Supabase upsert failed:", error.code, error.message)
      return NextResponse.json(
        { error: `Supabase error (${error.code}): ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(body)
  } catch (error: any) {
    console.error("[navigation-menu POST] Unexpected error:", error)
    return NextResponse.json(
      { error: "Server error: " + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
