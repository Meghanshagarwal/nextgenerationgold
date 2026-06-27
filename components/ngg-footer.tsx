"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export function NggFooter() {
  const [topCategories, setTopCategories] = useState<Array<{ name: string; slug: string }>>([
    { name: "Jewelry", slug: "jewelry" },
    { name: "High Jewelry", slug: "high-jewelry" },
    { name: "Love & Engagement", slug: "love-engagement" },
    { name: "Watches", slug: "watches" },
    { name: "Accessories", slug: "accessories" }
  ])

  useEffect(() => {
    async function fetchTopCategories() {
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          const products = await res.json()
          
          // Count products per category
          const counts: { [key: string]: number } = {}
          products.forEach((p: any) => {
            if (p.category) {
              const cat = p.category.trim()
              counts[cat] = (counts[cat] || 0) + 1
            }
          })

          // Sort by count descending and take top 5
          const sorted = Object.keys(counts)
            .map(name => {
              // Convert category name to slug
              const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "")
              return { name, slug, count: counts[name] }
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

          if (sorted.length > 0) {
            setTopCategories(sorted.map(s => ({ name: s.name, slug: s.slug })))
          }
        }
      } catch (e) {
        console.error("Failed to load top categories for footer:", e)
      }
    }
    fetchTopCategories()
  }, [])

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-10">
        
        {/* Newsletter */}
        <div className="mx-auto max-w-xl text-center">
          <h3 className="font-serif text-2xl md:text-3xl">Stay in Touch</h3>
          <p className="mt-3 text-sm leading-relaxed text-background/70">
            Sign up to receive the latest from Next Generation Gold, including new arrivals and exclusive events.
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Email Address"
              aria-label="Email Address"
              className="flex-1 border border-background/30 bg-transparent px-4 py-3 text-sm text-background placeholder:text-background/50 focus:border-background focus:outline-none"
            />
            <button
              type="submit"
              className="bg-background px-8 py-3 text-xs font-medium tracking-widest text-foreground uppercase transition-opacity hover:opacity-80"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Link columns */}
        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-background/20 pt-12 sm:grid-cols-3">
          
          {/* Column 1: CUSTOMER SERVICE */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-background">Customer Service</h4>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/contact" className="text-sm text-background/70 transition-colors hover:text-background">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="text-sm text-background/70 transition-colors hover:text-background">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-background/70 transition-colors hover:text-background">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-sm text-background/70 transition-colors hover:text-background">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: ABOUT NEXT GENERATION GOLD */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-background">About Next Generation Gold</h4>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/about-us#story" className="text-sm text-background/70 transition-colors hover:text-background">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about-us#mission" className="text-sm text-background/70 transition-colors hover:text-background">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/about-us#vision" className="text-sm text-background/70 transition-colors hover:text-background">
                  Our Vision
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CATEGORIES */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-background">Categories</h4>
            <ul className="mt-4 flex flex-col gap-3">
              {topCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-background/70 transition-colors hover:text-background capitalize">
                    {cat.name.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-center md:flex-row md:text-left">
          <span className="font-serif text-2xl tracking-tight">NEXT GENERATION GOLD</span>
          <p className="text-xs text-background/60">
            &copy; {new Date().getFullYear()} Next Generation Gold. All Rights Reserved.
          </p>
          <div className="flex gap-5 text-xs text-background/60">
            <Link href="/privacy-policy" className="transition-colors hover:text-background">
              Privacy
            </Link>
            <Link href="/terms-conditions" className="transition-colors hover:text-background">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-background">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
