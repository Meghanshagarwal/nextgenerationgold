import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const defaults = {
  cards: [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
      title: "NECKLACES",
      targetCategory: "necklaces"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80",
      title: "EARRINGS",
      targetCategory: "earrings"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80",
      title: "BRACELETS",
      targetCategory: "bracelets"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80",
      title: "RINGS",
      targetCategory: "rings"
    }
  ]
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
      .eq("key", "jewelry_page")
      .single()

    if (error) {
      if (error.code !== "PGRST116" && error.code !== "42P01") {
        console.warn("[jewelry-page GET] Supabase error:", error.code, error.message)
      }
      return NextResponse.json(defaults)
    }

    if (data?.value) {
      return NextResponse.json({ ...defaults, ...data.value })
    }
  } catch (e) {
    console.warn("[jewelry-page GET] Supabase threw:", e)
  }

  return NextResponse.json(defaults)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const merged = { ...defaults, ...body }

    const supabase = getSupabase()
    if (!supabase) {
      console.warn("[jewelry-page POST] No Supabase env vars — settings NOT persisted")
      return NextResponse.json(merged)
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "jewelry_page", value: merged, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      console.error("[jewelry-page POST] Supabase upsert failed:", error.code, error.message)
      return NextResponse.json(
        { error: `Supabase error (${error.code}): ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(merged)
  } catch (error: any) {
    console.error("[jewelry-page POST] Unexpected error:", error)
    return NextResponse.json(
      { error: "Server error: " + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
