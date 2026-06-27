import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const defaults = {
  beginningTitle: "The beginning of Next Generation Gold",
  beginningText: "Next Generation Gold was born out of a passion to craft jewelry that speaks to the modern soul while preserving timeless elegance. Every design is meticulously thought out and handcrafted by master artisans, combining traditional techniques with contemporary styling. We believe jewelry is not just an accessory; it is an expression of legacy.",
  beginningImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
  visionTitle: "Our Vision",
  visionText: "Our vision is to become the leading global luxury jewelry brand that inspires confidence, creativity, and self-expression. We aim to make fine craftsmanship accessible, introducing designs that redefine modern elegance and creating stories that are passed down through generations.",
  missionTitle: "Our Mission",
  missionText: "We deliver a seamless luxury experience that prioritizes absolute quality, style guidance, and detailed craftsmanship. NGG is dedicated to sourcing ethical, premium materials (from certified diamonds to conflict-free gemstones) to produce jewelry that evolves with you.",
  missionImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
  companyName: "Next Generation Gold Co., Ltd.",
  companyEmail: "concierge@nextgenerationgold.com",
  companyPhone: "0800-100-2070 (10:00 - 18:00)",
  companyWebsite: "https://nextgenerationgold.com",
  setupDate: "May 2026",
  capital: "64,840,984 INR",
  businessContent: "Luxury jewelry design, custom manufacturing, retail sales, and gemstone appraisal services."
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  const supabase = getSupabase()

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "about_us")
        .single()

      if (!error && data?.value) {
        return NextResponse.json({ ...defaults, ...data.value })
      }
    } catch (e) {
      console.warn("Supabase read about_us failed, using defaults", e)
    }
  }

  // Fallback: return defaults (no filesystem on Vercel)
  return NextResponse.json(defaults)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const merged = { ...defaults, ...body }

    const supabase = getSupabase()
    if (!supabase) {
      // No Supabase configured – just return the merged value so the UI doesn't break
      return NextResponse.json(merged)
    }

    // Upsert into site_settings table
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "about_us", value: merged }, { onConflict: "key" })

    if (error) {
      console.error("Supabase upsert about_us failed:", error)
      return NextResponse.json({ error: "Failed to save settings: " + error.message }, { status: 500 })
    }

    return NextResponse.json(merged)
  } catch (error: any) {
    console.error("POST /api/about-us error:", error)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
