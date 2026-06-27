import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ABOUT_FILE = path.join(process.cwd(), "lib", "about-us.json")

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

function readAboutUs() {
  try {
    if (fs.existsSync(ABOUT_FILE)) {
      return JSON.parse(fs.readFileSync(ABOUT_FILE, "utf-8"))
    }
  } catch (e) {
    console.error("Error reading local about-us:", e)
  }
  // Write default settings first time
  writeAboutUs(defaults)
  return defaults
}

function writeAboutUs(data: any) {
  try {
    fs.writeFileSync(ABOUT_FILE, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (e) {
    console.error("Error writing local about-us:", e)
    return false
  }
}

export async function GET() {
  const data = readAboutUs()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const current = readAboutUs()
    
    // Merge new values
    const updated = {
      ...current,
      ...body
    }
    
    const success = writeAboutUs(updated)
    if (!success) {
      return NextResponse.json({ error: "Failed to write settings" }, { status: 500 })
    }
    
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
