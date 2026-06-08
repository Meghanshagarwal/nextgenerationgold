"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { products } from "@/lib/products"

export function TiffanyNewJewelry() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateProgress = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0
    setProgress(ratio)
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft >= maxScroll - 1)
  }, [])

  useEffect(() => {
    updateProgress()
    window.addEventListener("resize", updateProgress)
    return () => window.removeEventListener("resize", updateProgress)
  }, [updateProgress])

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.6
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <h2 className="mb-12 text-center font-serif text-3xl text-foreground text-balance md:text-4xl">New Jewelry</h2>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={updateProgress}
          className="flex snap-x snap-mandatory gap-8 overflow-x-auto px-6 pb-4 md:px-16 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, index) => (
            <Link
              key={index}
              href={product.href}
              className="group w-[260px] flex-none snap-start sm:w-[300px] md:w-[340px]"
            >
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-background">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-6 text-center">
                <p className="font-serif text-lg text-foreground">{product.collection}</p>
                <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground group-hover:underline">
                  {product.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel navigation: arrows + progress track */}
        <div className="mt-10 flex items-center justify-center gap-6 px-6 md:px-16">
          <button
            type="button"
            onClick={() => scrollBy("left")}
            disabled={atStart}
            aria-label="Previous products"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-foreground transition-all hover:bg-muted disabled:cursor-default disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.25} />
          </button>

          <div className="h-px w-full max-w-md bg-border" role="presentation">
            <div
              className="h-px bg-foreground transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(progress * 100, 8)}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => scrollBy("right")}
            disabled={atEnd}
            aria-label="Next products"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-foreground transition-all hover:bg-muted disabled:cursor-default disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </section>
  )
}
