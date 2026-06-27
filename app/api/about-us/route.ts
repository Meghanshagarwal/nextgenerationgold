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

// Try to auto-create the site_settings table if it doesn't exist
async function ensureTable(supabase: ReturnType<typeof createClient>) {
  try {
    await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `
    })
  } catch (_) {
    // rpc may not exist — try a raw query approach via insert to detect table
  }
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
      .eq("key", "about_us")
      .single()

    if (error) {
      // PGRST116 = no rows found (normal on first run)
      // 42P01 = table doesn't exist
      if (error.code === "42P01") {
        console.warn("[about-us GET] site_settings table missing — returning defaults")
      } else if (error.code !== "PGRST116") {
        console.warn("[about-us GET] Supabase error:", error.code, error.message)
      }
      return NextResponse.json(defaults)
    }

    if (data?.value) {
      return NextResponse.json({ ...defaults, ...data.value })
    }
  } catch (e) {
    console.warn("[about-us GET] Supabase threw:", e)
  }

  return NextResponse.json(defaults)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const merged = { ...defaults, ...body }

    const supabase = getSupabase()
    if (!supabase) {
      console.warn("[about-us POST] No Supabase env vars — settings NOT persisted")
      return NextResponse.json(merged)
    }

    // First attempt to upsert
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "about_us", value: merged, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      if (error.code === "42P01") {
        // Table doesn't exist — tell user exactly what SQL to run
        console.error("[about-us POST] site_settings table missing. Run SQL migration.")
        return NextResponse.json(
          {
            error: "The 'site_settings' table does not exist in your Supabase database.",
            fix: "Run this SQL in your Supabase Dashboard → SQL Editor:\n\nCREATE TABLE IF NOT EXISTS site_settings (\n  key TEXT PRIMARY KEY,\n  value JSONB NOT NULL,\n  updated_at TIMESTAMPTZ DEFAULT now()\n);"
          },
          { status: 503 }
        )
      }

      console.error("[about-us POST] Supabase upsert failed:", error.code, error.message)
      return NextResponse.json(
        { error: `Supabase error (${error.code}): ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(merged)
  } catch (error: any) {
    console.error("[about-us POST] Unexpected error:", error)
    return NextResponse.json(
      { error: "Server error: " + (error?.message || String(error)) },
      { status: 500 }
    )
  }
}
