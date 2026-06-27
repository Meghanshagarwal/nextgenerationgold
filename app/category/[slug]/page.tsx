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
    const normalizedSlug = slug.toLowerCase().replace(/-/g, "")
    
    // Check if any product has a matching category field
    const categoryFiltered = products.filter(p => {
      if (!p.category) return false
      const normalizedCat = p.category.toLowerCase().replace(/[^a-z0-9]/g, "")
      return normalizedCat === normalizedSlug || normalizedCat.includes(normalizedSlug) || normalizedSlug.includes(normalizedCat)
    })

    if (categoryFiltered.length > 0) {
      return categoryFiltered
    }

    // Check if the slug matches a collection name (case-insensitive, hyphen-insensitive)
    const collectionFiltered = products.filter(p => {
      const normalizedCollection = p.collection.toLowerCase().replace(/[^a-z0-9]/g, "")
      return normalizedCollection.includes(normalizedSlug) || normalizedSlug.includes(normalizedCollection)
    })

    if (collectionFiltered.length > 0) {
      return collectionFiltered
    }

    // General fallback categories show all items (since they are all jewelry)
    if (slug === "jewelry" || slug === "high-jewelry" || slug === "gifts") {
      return products
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

      {/* ===== CATEGORY HERO BANNER / EDITORIAL ===== */}
      {slug === "high-jewelry" ? (
        <section className="bg-background pt-12 pb-8 md:pt-16 text-center">
          <div className="mx-auto max-w-[1200px] px-6">
            <h1 className="font-serif text-4xl text-foreground md:text-5xl lg:text-6xl tracking-wide">High Jewelry</h1>
            <p className="mx-auto mt-6 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
              As the premier Indian high jewelry house, Next Generation Gold is celebrated for its inventive artistry, unparalleled craft and a love of extraordinary diamonds and colored gemstones. Our artisans set these miracles of nature into exquisite creations, symbolizing a constant dialogue between maker and material, craft and creativity.
            </p>
          </div>
          
          {/* Editorial Banner */}
          <div className="mx-auto max-w-[1600px] px-6 md:px-10 mt-12 mb-4">
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-secondary">
              <img 
                src="/images/high-jewelry-banner.png" 
                alt="Next Generation Gold High Jewelry Collection"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                <div className="max-w-xl text-left text-white">
                  <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-wide leading-tight">
                    Introducing Our New Collection
                  </h3>
                  <p className="mt-3 text-xs md:text-sm tracking-widest uppercase font-medium text-white/90">
                    A Celebration of Unmatched Artistry
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="border-b border-border bg-secondary py-16 md:py-24 text-center">
          <div className="mx-auto max-w-[1600px] px-6 md:px-10">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Next Generation Gold</span>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">{categoryTitle}</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground leading-relaxed">
              Discover exquisite craftsmanship and iconic designs engineered to celebrate life's most meaningful moments.
            </p>
          </div>
        </section>
      )}

      {/* ===== CONTROLS ROW ===== */}
      <section className="border-y border-border py-4 bg-background sticky top-[var(--header-height,132px)] z-40 transition-[top] duration-300">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 flex items-center justify-between gap-4">
          
          {/* Left Column: Sort */}
          <div className="relative border border-border px-5 py-3 min-w-[180px] flex items-center justify-between bg-background hover:bg-secondary transition-colors">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent border-none pr-8 pl-1 py-0.5 text-[10px] font-bold tracking-widest uppercase focus:outline-none cursor-pointer w-full text-foreground"
            >
              <option value="featured">Sort By: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-4 top-4.5 h-3.5 w-3.5 text-foreground pointer-events-none" />
          </div>

          {/* Center Column: Title & Count & Personalize */}
          <div className="flex items-center gap-8 justify-center flex-1">
            <span className="hidden lg:inline text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
              {processedProducts.length} {processedProducts.length === 1 ? "Product" : "Products"}
            </span>
            <h2 className="font-serif text-xl md:text-2xl lg:text-3xl text-foreground tracking-wide text-center uppercase min-w-[120px] select-none">
              {slug === "high-jewelry" ? "High Jewelry" : categoryTitle}
            </h2>
            <label className="hidden lg:flex items-center gap-2 cursor-pointer select-none text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
              <input 
                type="checkbox"
                className="h-3.5 w-3.5 border-border accent-foreground rounded focus:ring-0 cursor-pointer"
              />
              <span>Personalize</span>
            </label>
          </div>

          {/* Right Column: Filters */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="border border-border px-5 py-3.5 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:bg-secondary transition-colors cursor-pointer bg-background"
          >
            <span>Filters</span>
            <SlidersHorizontal className="h-3.5 w-3.5 text-foreground" />
          </button>

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
              <Link key={p.slug} href={p.href} className="group block text-center">
                {/* Image Aspect Box */}
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-[#F9F9F9] group-hover:bg-[#F3F3F3] transition-colors duration-300 p-8">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Details */}
                <div className="mt-5">
                  <p className="font-serif text-lg text-foreground tracking-wide">{p.collection}</p>
                  <p className="mx-auto mt-1 max-w-[260px] text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                    {p.name}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{p.price}</p>
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
