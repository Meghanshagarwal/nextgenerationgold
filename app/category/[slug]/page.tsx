"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { NggHeader } from "@/components/ngg-header"
import { NggFooter } from "@/components/ngg-footer"
import { Product } from "@/lib/products"

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("featured")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Fetch products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch (e) {
        console.error("Failed to load products for category:", e)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Resolve Category Display Title
  const categoryTitle = useMemo(() => {
    const mapping: Record<string, string> = {
      "jewelry": "Fine Jewelry",
      "high-jewelry": "High Jewelry",
      "love-engagement": "Love & Engagement",
      "love-and-engagement": "Love & Engagement",
      "watches": "Luxury Timepieces",
      "home": "Home & Accessories",
      "accessories": "Accessories",
      "gifts": "Luxury Gifts",
      "hardwear": "The HardWear Collection",
      "smile": "The Smile Collection",
      "signature-collection": "Signature Collection"
    }
    
    return mapping[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }, [slug])

  // Get initial category/collection-filtered products
  const categoryProducts = useMemo(() => {
    if (slug === "jewelry" || slug === "high-jewelry" || slug === "gifts") {
      // General categories show all items (since they are all jewelry)
      return products
    }

    // Check if the slug matches a collection name (case-insensitive, hyphen-insensitive)
    const normalizedSlug = slug.toLowerCase().replace(/-/g, "")
    const collectionFiltered = products.filter(p => {
      const normalizedCollection = p.collection.toLowerCase().replace(/[^a-z0-9]/g, "")
      return normalizedCollection.includes(normalizedSlug) || normalizedSlug.includes(normalizedCollection)
    })

    if (collectionFiltered.length > 0) {
      return collectionFiltered
    }

    // Otherwise show all products as a fallback
    return products
  }, [products, slug])

  // Get filter options based on current category products
  const filterOptions = useMemo(() => {
    const collections = Array.from(new Set(categoryProducts.map(p => p.collection)))
    
    // Normalize materials for filtering (e.g. Yellow Gold, Rose Gold)
    const rawMaterials = categoryProducts.map(p => {
      if (p.material.toLowerCase().includes("yellow")) return "Yellow Gold"
      if (p.material.toLowerCase().includes("rose")) return "Rose Gold"
      if (p.material.toLowerCase().includes("white")) return "White Gold"
      if (p.material.toLowerCase().includes("platinum")) return "Platinum"
      if (p.material.toLowerCase().includes("mother")) return "Mother-of-Pearl"
      return p.material
    })
    const materials = Array.from(new Set(rawMaterials)).filter(Boolean)

    return { collections, materials }
  }, [categoryProducts])

  // Apply filters and sorting
  const processedProducts = useMemo(() => {
    let result = [...categoryProducts]

    // 1. Collection Filter
    if (selectedCollections.length > 0) {
      result = result.filter(p => selectedCollections.includes(p.collection))
    }

    // 2. Material Filter
    if (selectedMaterials.length > 0) {
      result = result.filter(p => {
        return selectedMaterials.some(m => {
          return p.material.toLowerCase().includes(m.toLowerCase().split(" ")[0])
        })
      })
    }

    // 3. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, ""))
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, ""))
        return pA - pB
      })
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, ""))
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, ""))
        return pB - pA
      })
    }

    return result
  }, [categoryProducts, selectedCollections, selectedMaterials, sortBy])

  // Toggle Filters
  const handleCollectionToggle = (col: string) => {
    setSelectedCollections(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  const handleMaterialToggle = (mat: string) => {
    setSelectedMaterials(prev => 
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    )
  }

  const clearAllFilters = () => {
    setSelectedCollections([])
    setSelectedMaterials([])
    setSortBy("featured")
  }

  return (
    <main className="min-h-screen bg-background">
      <NggHeader />

      {/* ===== CATEGORY HERO BANNER ===== */}
      <section className="border-b border-border bg-secondary py-16 md:py-24 text-center">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Next Generation Gold</span>
          <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">{categoryTitle}</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground leading-relaxed">
            Discover exquisite craftsmanship and iconic designs engineered to celebrate life's most meaningful moments.
          </p>
        </div>
      </section>

      {/* ===== MAIN CONTROLS ROW ===== */}
      <section className="border-b border-border py-4 bg-background sticky top-[72px] md:top-[124px] lg:top-[132px] z-40 shadow-sm transition-[top] duration-300">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 flex items-center justify-between">
          {/* Desktop Filter Toggle Button */}
          <button 
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase hover:opacity-60 transition-opacity"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {(selectedCollections.length + selectedMaterials.length) > 0 && `(${selectedCollections.length + selectedMaterials.length})`}
          </button>

          {/* Product Count (Desktop only) */}
          <span className="hidden md:inline text-xs text-muted-foreground tracking-wider">
            {processedProducts.length} {processedProducts.length === 1 ? "Product" : "Products"}
          </span>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tracking-wider uppercase font-semibold hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border-none pr-8 pl-2 py-1 text-xs font-semibold tracking-widest uppercase focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-0 top-1.5 h-3.5 w-3.5 text-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATALOG GRID LAYOUT ===== */}
      <section className="mx-auto max-w-[1600px] px-6 py-12 md:px-10 md:py-16">
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t border-foreground" />
          </div>
        ) : processedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="font-serif text-2xl text-foreground mb-4">No Products Match</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Try adjusting your collections or material filters to discover other registry designs.
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-foreground text-background px-8 py-3 text-xs font-medium tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {processedProducts.map((p) => (
              <Link key={p.slug} href={p.href} className="group block">
                {/* Image Aspect Box */}
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-secondary p-6">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Details */}
                <div className="mt-5 text-center">
                  <p className="font-serif text-lg text-foreground">{p.collection}</p>
                  <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground group-hover:underline">
                    {p.name}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== FILTERS DRAWER / SIDEBAR (Responsive Overlay) ===== */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Slider Drawer Panel */}
          <div className="relative z-10 flex w-full max-w-md flex-col bg-background shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h3 className="text-sm font-semibold tracking-widest uppercase text-foreground">Filters</h3>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="text-foreground hover:opacity-60 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Content scrollable */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              {/* Collection Section */}
              {filterOptions.collections.length > 1 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-foreground">Collection</h4>
                  <div className="flex flex-col gap-3">
                    {filterOptions.collections.map((col) => (
                      <label key={col} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(col)}
                          onChange={() => handleCollectionToggle(col)}
                          className="h-4 w-4 border-border accent-foreground rounded focus:ring-0"
                        />
                        <span className="text-muted-foreground hover:text-foreground transition-colors">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Section */}
              {filterOptions.materials.length > 1 && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-foreground">Material</h4>
                  <div className="flex flex-col gap-3">
                    {filterOptions.materials.map((mat) => (
                      <label key={mat} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(mat)}
                          onChange={() => handleMaterialToggle(mat)}
                          className="h-4 w-4 border-border accent-foreground rounded focus:ring-0"
                        />
                        <span className="text-muted-foreground hover:text-foreground transition-colors">{mat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-border p-6 flex gap-4 bg-secondary/30">
              <button
                onClick={clearAllFilters}
                className="flex-1 border border-foreground bg-transparent py-3 text-xs font-semibold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-all"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 bg-foreground py-3 text-xs font-semibold uppercase tracking-widest text-background hover:opacity-90 transition-opacity"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <NggFooter />
    </main>
  )
}
