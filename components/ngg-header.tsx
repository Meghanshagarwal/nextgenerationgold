"use client"

import Link from "next/link"
import { useEffect, useState, useRef, useMemo } from "react"
import { Search, MapPin, User, ShoppingBag, ConciergeBell, Menu, X } from "lucide-react"

type Product = {
  slug: string
  name: string
  collection: string
  price: string
  image: string
  category?: string
  tags?: string[]
}

export function NggHeader() {
  const [navItems, setNavItems] = useState<Array<{ id: number, name: string, href: string }>>([
    { id: 1, name: "HIGH JEWELRY", href: "/category/high-jewelry" },
    { id: 2, name: "JEWELRY", href: "/category/jewelry" },
    { id: 3, name: "LOVE & ENGAGEMENT", href: "/category/love-engagement" },
    { id: 4, name: "WATCHES", href: "/category/watches" },
    { id: 5, name: "HOME", href: "/category/home" },
    { id: 6, name: "ACCESSORIES", href: "/category/accessories" },
    { id: 7, name: "ABOUT US", href: "/about-us" },
  ])
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const headerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/navigation-menu", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setNavItems(data)
        }
      } catch (e) {
        console.error("Failed to load navigation menu:", e)
      }
    }
    fetchMenu()
  }, [])

  // Fetch products once for search
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          const data = await res.json()
          setAllProducts(data)
        }
      } catch (e) {
        console.error("Failed to load products for search:", e)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const updateHeaderHeight = () => {
      const isScrolled = window.scrollY > 80
      setScrolled(isScrolled)
      
      let height = 72 // mobile default
      if (headerRef.current) {
        height = headerRef.current.offsetHeight
      } else {
        if (window.innerWidth >= 1024) { // lg
          height = isScrolled ? 60 : 132
        } else if (window.innerWidth >= 768) { // md
          height = isScrolled ? 60 : 124
        }
      }
      
      document.documentElement.style.setProperty("--header-height", `${height}px`)
    }

    const handleScroll = () => {
      updateHeaderHeight()
      setTimeout(updateHeaderHeight, 100)
      setTimeout(updateHeaderHeight, 310)
    }

    updateHeaderHeight()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", updateHeaderHeight, { passive: true })
    
    const timers = [100, 300, 600, 1000].map(delay => setTimeout(updateHeaderHeight, delay))
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", updateHeaderHeight)
      timers.forEach(t => clearTimeout(t))
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen, searchOpen])

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else {
      setSearchQuery("")
    }
  }, [searchOpen])

  // Close search on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) setSearchOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [searchOpen])

  // Filtered results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    return allProducts.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(q)
      const collectionMatch = p.collection.toLowerCase().includes(q)
      const categoryMatch = p.category ? p.category.toLowerCase().includes(q) : false
      const tagMatch = p.tags ? p.tags.some(t => t.toLowerCase().includes(q)) : false
      return nameMatch || collectionMatch || categoryMatch || tagMatch
    }).slice(0, 8)
  }, [searchQuery, allProducts])

  const openSearch = () => {
    setSearchOpen(true)
    setMenuOpen(false)
  }

  return (
    <div className="relative h-[72px] md:h-[124px] lg:h-[132px] w-full">
      <header ref={headerRef} className="fixed top-0 left-0 z-50 w-full bg-background shadow-sm">
      {/* ===== MOBILE HEADER ===== */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">
        <div className="flex items-center gap-4 text-foreground">
          <button aria-label="Open menu" onClick={() => setMenuOpen(true)} className="transition-opacity hover:opacity-60">
            <Menu className="h-6 w-6" strokeWidth={1.25} />
          </button>
          <button aria-label="Search" onClick={openSearch} className="transition-opacity hover:opacity-60">
            <Search className="h-6 w-6" strokeWidth={1.25} />
          </button>
        </div>

        <Link href="/" aria-label="Next Generation Gold home" className="px-2 text-center">
          <span className="font-serif text-sm font-semibold tracking-wider text-foreground">
            NEXT GENERATION GOLD
          </span>
        </Link>

        <div className="flex items-center gap-4 text-foreground">
          <button aria-label="Concierge" className="transition-opacity hover:opacity-60">
            <ConciergeBell className="h-6 w-6" strokeWidth={1.25} />
          </button>
          <button aria-label="Shopping bag" className="transition-opacity hover:opacity-60">
            <ShoppingBag className="h-6 w-6" strokeWidth={1.25} />
          </button>
        </div>
      </div>

      {/* ===== DESKTOP HEADER ===== */}
      <div className="hidden md:block">
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 pt-8 pb-2 md:px-10">
              <div className="flex items-center gap-5 text-foreground">
                <button aria-label="Search" onClick={openSearch} className="transition-opacity hover:opacity-60">
                  <Search className="h-6 w-6" strokeWidth={1.25} />
                </button>
                <button aria-label="Store locator" className="transition-opacity hover:opacity-60">
                  <MapPin className="h-6 w-6" strokeWidth={1.25} />
                </button>
              </div>

              <Link href="/" aria-label="Next Generation Gold home" className="flex-1 px-2 text-center">
                <span className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
                  NEXT GENERATION GOLD
                </span>
              </Link>

              <div className="flex items-center gap-5 text-foreground">
                <button aria-label="Concierge" className="transition-opacity hover:opacity-60">
                  <ConciergeBell className="h-6 w-6" strokeWidth={1.25} />
                </button>
                <button aria-label="Account" className="transition-opacity hover:opacity-60">
                  <User className="h-6 w-6" strokeWidth={1.25} />
                </button>
                <button aria-label="Shopping bag" className="transition-opacity hover:opacity-60">
                  <ShoppingBag className="h-6 w-6" strokeWidth={1.25} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <nav className={`transition-[padding] duration-300 ease-in-out ${scrolled ? "py-4" : "pb-4"}`}>
          <div className="mx-auto flex max-w-[1600px] items-center px-6 md:px-10">
            <div
              className={`flex w-[180px] flex-none items-center justify-start gap-5 text-foreground transition-opacity duration-300 ease-in-out ${
                scrolled ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <button aria-label="Search" onClick={openSearch} className="transition-opacity hover:opacity-60">
                <Search className="h-6 w-6" strokeWidth={1.25} />
              </button>
              <button aria-label="Store locator" className="transition-opacity hover:opacity-60">
                <MapPin className="h-6 w-6" strokeWidth={1.25} />
              </button>
            </div>

            <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-7 gap-y-2 text-foreground">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[13px] font-medium tracking-wide transition-opacity hover:opacity-60"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="#"
                  className="font-serif text-xl italic transition-opacity hover:opacity-60"
                >
                  World of NGG
                </Link>
              </li>
            </ul>

            <div
              className={`flex w-[180px] flex-none items-center justify-end gap-5 text-foreground transition-opacity duration-300 ease-in-out ${
                scrolled ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <button aria-label="Concierge" className="transition-opacity hover:opacity-60">
                <ConciergeBell className="h-6 w-6" strokeWidth={1.25} />
              </button>
              <button aria-label="Account" className="transition-opacity hover:opacity-60">
                <User className="h-6 w-6" strokeWidth={1.25} />
              </button>
              <button aria-label="Shopping bag" className="transition-opacity hover:opacity-60">
                <ShoppingBag className="h-6 w-6" strokeWidth={1.25} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* ===== MOBILE MENU DRAWER ===== */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-4">
              <span className="font-serif text-base font-medium tracking-tight text-foreground">
                NEXT GENERATION GOLD
              </span>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="text-foreground">
                <X className="h-6 w-6" strokeWidth={1.25} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-2">
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li key={item.name} className="border-b border-foreground/5">
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-4 text-sm font-medium tracking-wide text-foreground transition-opacity hover:opacity-60"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li className="border-b border-foreground/5">
                  <Link
                    href="#"
                    onClick={() => setMenuOpen(false)}
                    className="block py-4 font-serif text-lg italic text-foreground transition-opacity hover:opacity-60"
                  >
                    World of NGG
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="flex items-center gap-6 border-t border-foreground/10 px-4 py-4 text-foreground">
              <button aria-label="Store locator" className="flex items-center gap-2 text-sm">
                <MapPin className="h-5 w-5" strokeWidth={1.25} />
                Store Locator
              </button>
              <button aria-label="Account" className="flex items-center gap-2 text-sm">
                <User className="h-5 w-5" strokeWidth={1.25} />
                Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEARCH OVERLAY ===== */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-background shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="mx-auto max-w-[900px] px-6 py-8 md:px-10 md:py-10">
              {/* Search Input Row */}
              <div className="flex items-center gap-4">
                <Search className="h-5 w-5 text-muted-foreground flex-none" strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, collections, categories..."
                  className="flex-1 bg-transparent text-lg md:text-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-serif"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="flex-none text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-1 border-b border-border" />

              {/* Results */}
              <div className="mt-6 max-h-[60vh] overflow-y-auto">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-8">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Popular Searches</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Ring", "Emerald", "Diamond", "Gold", "Luxury"].map(term => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-4 py-2 text-xs tracking-wide border border-border rounded-full text-foreground hover:bg-secondary hover:border-[#9A7B4F] transition-all"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">No results found for &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try searching by product name, collection, or category</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                      {searchResults.length} Result{searchResults.length !== 1 ? "s" : ""}
                    </p>
                    {searchResults.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/product/${product.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/70 transition-colors group"
                      >
                        <div className="w-16 h-16 flex-none bg-[#FAF9F6] rounded overflow-hidden border border-border p-1.5">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">{product.collection}</p>
                          <p className="text-sm font-medium text-foreground mt-0.5 truncate group-hover:text-[#9A7B4F] transition-colors">{product.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{product.price}</p>
                        </div>
                        <svg className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#9A7B4F] transition-colors flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
    </div>
  )
}
