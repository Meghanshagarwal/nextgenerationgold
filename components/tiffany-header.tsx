"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Search, MapPin, User, ShoppingBag, ConciergeBell, Menu, X } from "lucide-react"

const navItems = [
  "HIGH JEWELRY",
  "JEWELRY",
  "LOVE & ENGAGEMENT",
  "WATCHES",
  "HOME",
  "ACCESSORIES",
  "GIFTS",
]

export function TiffanyHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const updateHeaderHeight = () => {
      const isScrolled = window.scrollY > 80
      setScrolled(isScrolled)
      
      let height = 72 // mobile default
      if (window.innerWidth >= 1024) { // lg
        height = isScrolled ? 60 : 132
      } else if (window.innerWidth >= 768) { // md
        height = isScrolled ? 60 : 124
      }
      
      document.documentElement.style.setProperty("--header-height", `${height}px`)
    }

    updateHeaderHeight()
    window.addEventListener("scroll", updateHeaderHeight, { passive: true })
    window.addEventListener("resize", updateHeaderHeight, { passive: true })
    
    return () => {
      window.removeEventListener("scroll", updateHeaderHeight)
      window.removeEventListener("resize", updateHeaderHeight)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  return (
    <div className="relative h-[72px] md:h-[124px] lg:h-[132px] w-full">
      <header className="fixed top-0 left-0 z-50 w-full bg-background shadow-sm">
      {/* ===== MOBILE HEADER ===== */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">
        {/* Left: menu + search */}
        <div className="flex items-center gap-4 text-foreground">
          <button aria-label="Open menu" onClick={() => setMenuOpen(true)} className="transition-opacity hover:opacity-60">
            <Menu className="h-6 w-6" strokeWidth={1.25} />
          </button>
          <button aria-label="Search" className="transition-opacity hover:opacity-60">
            <Search className="h-6 w-6" strokeWidth={1.25} />
          </button>
        </div>

        {/* Center: wordmark */}
        <Link href="/" aria-label="Next Generation Gold home" className="px-2 text-center">
          <span className="font-serif text-sm font-semibold tracking-wider text-foreground">
            NEXT GENERATION GOLD
          </span>
        </Link>

        {/* Right: concierge + bag */}
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
        {/* Top row: icons + collapsible wordmark */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            scrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 pt-8 pb-2 md:px-10">
              {/* Left icons */}
              <div className="flex items-center gap-5 text-foreground">
                <button aria-label="Search" className="transition-opacity hover:opacity-60">
                  <Search className="h-6 w-6" strokeWidth={1.25} />
                </button>
                <button aria-label="Store locator" className="transition-opacity hover:opacity-60">
                  <MapPin className="h-6 w-6" strokeWidth={1.25} />
                </button>
              </div>

              {/* Logo */}
              <Link href="/" aria-label="Next Generation Gold home" className="flex-1 px-2 text-center">
                <span className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
                  NEXT GENERATION GOLD
                </span>
              </Link>

              {/* Right icons */}
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

        {/* Navigation row (also holds icons + compact wordmark when scrolled) */}
        <nav className={`transition-[padding] duration-300 ease-in-out ${scrolled ? "py-4" : "pb-4"}`}>
          <div className="mx-auto flex max-w-[1600px] items-center px-6 md:px-10">
            {/* Compact left icons - only visible when scrolled */}
            <div
              className={`flex w-[180px] flex-none items-center justify-start gap-5 text-foreground transition-opacity duration-300 ease-in-out ${
                scrolled ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <button aria-label="Search" className="transition-opacity hover:opacity-60">
                <Search className="h-6 w-6" strokeWidth={1.25} />
              </button>
              <button aria-label="Store locator" className="transition-opacity hover:opacity-60">
                <MapPin className="h-6 w-6" strokeWidth={1.25} />
              </button>
            </div>

            {/* Nav links - centered */}
            <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-7 gap-y-2 text-foreground">
              {navItems.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-[13px] font-medium tracking-wide transition-opacity hover:opacity-60"
                  >
                    {item}
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

            {/* Compact right icons - only visible when scrolled */}
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
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
                  <li key={item} className="border-b border-foreground/5">
                    <Link
                      href="#"
                      onClick={() => setMenuOpen(false)}
                      className="block py-4 text-sm font-medium tracking-wide text-foreground transition-opacity hover:opacity-60"
                    >
                      {item}
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
    </header>
    </div>
  )
}
