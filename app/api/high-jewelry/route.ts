import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const defaults = {
  title: "High Jewelry",
  description: "As the premier Indian high jewelry house, Next Generation Gold is celebrated for its inventive artistry, unparalleled craft and a love of extraordinary diamonds and colored gemstones. Our artisans set these miracles of nature into exquisite creations, symbolizing a constant dialogue between maker and material, craft and creativity.",
  bannerImage: "/images/high-jewelry-banner.png",
  bannerTitle: "Introducing Our New Collection",
  bannerSubtitle: "A Celebration of Unmatched Artistry"
}

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
      .eq("key", "high_jewelry")
      .single()

    if (error) {
      if (error.code !== "PGRST116" && error.code !== "42P01") {
        console.warn("[high-jewelry GET] Supabase error:", error.code, error.message)
      }
      return NextResponse.json(defaults)
    }

    if (data?.value) {
      return NextResponse.json({ ...defaults, ...data.value })
    }
  } catch (e) {
    console.warn("[high-jewelry GET] Supabase threw:", e)
  }

  return NextResponse.json(defaults)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const merged = { ...defaults, ...body }

    const supabase = getSupabase()
    if (!supabase) {
      console.warn("[high-jewelry POST] No Supabase env vars — settings NOT persisted")
      return NextResponse.json(merged)
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "high_jewelry", value: merged, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      console.error("[high-jewelry POST] Supabase upsert failed:", error.code, error.message)
      return NextResponse.json(
        { error: `Supabase error (${error.code}): ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(merged)
  } catch (error: any) {
    console.error("[high-jewelry POST] Unexpected error:", error)
    return NextResponse.json(
      { error: "Server error: " + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
