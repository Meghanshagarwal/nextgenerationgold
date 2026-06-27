import { NextResponse } from "next/server"

const WP_URL = process.env.WORDPRESS_URL || ""
const WP_USER = process.env.WORDPRESS_USER || ""
const WP_PASS = process.env.WORDPRESS_APP_PASSWORD || ""

function getAuthHeader() {
  return "Basic " + Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64")
}

// GET /api/media?page=1&search=ring
// Returns list of images from WordPress media library
export async function GET(req: Request) {
  if (!WP_URL || !WP_USER || !WP_PASS) {
    return NextResponse.json({ error: "WordPress credentials not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const page = searchParams.get("page") || "1"
  const search = searchParams.get("search") || ""

  try {
    const params = new URLSearchParams({
      per_page: "40",
      page,
      media_type: "image",
      orderby: "date",
      order: "desc",
      ...(search ? { search } : {})
    })

    const res = await fetch(`${WP_URL}/wp-json/wp/v2/media?${params}`, {
      headers: { Authorization: getAuthHeader() },
      next: { revalidate: 0 }
    })

    if (!res.ok) {
      let errMsg = "Failed to fetch media from WordPress"
      try {
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const err = await res.json()
          errMsg = err.message || errMsg
        } else {
          errMsg = `WordPress returned status ${res.status}: ${res.statusText || "HTML Error Response"}`
        }
      } catch (_) {}
      return NextResponse.json({ error: errMsg }, { status: res.status })
    }

    const totalPages = res.headers.get("X-WP-TotalPages") || "1"
    const total = res.headers.get("X-WP-Total") || "0"
    
    const contentType = res.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text()
      return NextResponse.json({ error: `WordPress returned non-JSON content: ${text.substring(0, 150)}...` }, { status: 502 })
    }
    const data = await res.json()

    const images = data.map((item: any) => ({
      id: item.id,
      url: item.source_url,
      title: item.title?.rendered || item.slug,
      thumbnail: item.media_details?.sizes?.thumbnail?.source_url || item.source_url,
      medium: item.media_details?.sizes?.medium?.source_url || item.source_url,
      width: item.media_details?.width || 0,
      height: item.media_details?.height || 0,
      filesize: item.media_details?.filesize || 0,
      date: item.date,
    }))

    return NextResponse.json({ images, totalPages: parseInt(totalPages), total: parseInt(total) })
  } catch (e: any) {
    console.error("[media GET] Error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/media  — multipart/form-data with a "file" field
// Uploads image to WordPress and returns the full URL
export async function POST(req: Request) {
  if (!WP_URL || !WP_USER || !WP_PASS) {
    return NextResponse.json({ error: "WordPress credentials not configured" }, { status: 503 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only image files are allowed (JPG, PNG, WebP, GIF)" }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max size is 10MB." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const res = await fetch(`${WP_URL}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Type": file.type,
      },
      body: buffer,
    })

    if (!res.ok) {
      let errMsg = "Upload to WordPress failed"
      try {
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const err = await res.json()
          errMsg = err.message || errMsg
        } else {
          errMsg = `WordPress returned status ${res.status}: ${res.statusText || "HTML Error Response"}`
        }
      } catch (_) {}
      console.error("[media POST] WP upload failed:", errMsg)
      return NextResponse.json({ error: errMsg }, { status: res.status })
    }

    const contentType = res.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text()
      return NextResponse.json({ error: `WordPress upload response was non-JSON: ${text.substring(0, 150)}...` }, { status: 502 })
    }
    const data = await res.json()

    return NextResponse.json({
      id: data.id,
      url: data.source_url,
      title: data.title?.rendered || file.name,
      thumbnail: data.media_details?.sizes?.thumbnail?.source_url || data.source_url,
      medium: data.media_details?.sizes?.medium?.source_url || data.source_url,
    })
  } catch (e: any) {
    console.error("[media POST] Error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/media?id=123
export async function DELETE(req: Request) {
  if (!WP_URL || !WP_USER || !WP_PASS) {
    return NextResponse.json({ error: "WordPress credentials not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Media ID is required" }, { status: 400 })
  }

  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/media/${id}?force=true`, {
      method: "DELETE",
      headers: { Authorization: getAuthHeader() }
    })

    if (!res.ok) {
      let errMsg = "Failed to delete media from WordPress"
      try {
        const contentType = res.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const err = await res.json()
          errMsg = err.message || errMsg
        } else {
          errMsg = `WordPress returned status ${res.status}: ${res.statusText || "HTML Error Response"}`
        }
      } catch (_) {}
      return NextResponse.json({ error: errMsg }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[media DELETE] Error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
