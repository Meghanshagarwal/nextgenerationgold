"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { MapPin, ChevronRight, Heart, ChevronDown } from "lucide-react"
import { TiffanyHeader } from "@/components/tiffany-header"
import { TiffanyFooter } from "@/components/tiffany-footer"
import { getProduct, products } from "@/lib/products"

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const product = getProduct(slug)
  const [addedToCart, setAddedToCart] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false)

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <TiffanyHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="font-serif text-4xl text-foreground">Product Not Found</h1>
          <p className="mt-4 text-muted-foreground">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block bg-foreground px-10 py-4 text-xs font-medium tracking-widest text-background uppercase transition-opacity hover:opacity-80"
          >
            Return to Homepage
          </Link>
        </div>
        <TiffanyFooter />
      </main>
    )
  }

  // Get related products (same collection, excluding current)
  const related = products.filter(
    (p) => p.collection === product.collection && p.slug !== product.slug
  )

  const handleAddToCart = () => {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  return (
    <main className="min-h-screen bg-background">
      <TiffanyHeader />

      {/* ===== Product Section — Two Column Layout ===== */}
      <section className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr]">

          {/* ========== LEFT COLUMN — STICKY ========== */}
          <div className="order-2 border-r border-border lg:order-1">
            <div className="lg:sticky lg:top-[120px] lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
              <div className="px-6 py-10 md:px-10 lg:py-14">
                {/* Collection name */}
                <h1 className="font-serif text-2xl text-foreground md:text-[28px] leading-tight">
                  NGG {product.collection}
                </h1>

                {/* Product name */}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {product.name}
                </p>

                {/* Price */}
                <p className="mt-6 text-base text-foreground">{product.price}</p>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-3">
                  {/* Add to Cart */}
                  <button
                    id="add-to-cart-btn"
                    onClick={handleAddToCart}
                    className="flex w-full items-center justify-center gap-2 bg-foreground px-8 py-4 text-xs font-medium tracking-widest text-background uppercase transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                  >
                    {addedToCart ? "Added to Cart" : "Add to Cart"}
                  </button>

                  {/* Contact Advisor */}
                  <button
                    id="contact-advisor-btn"
                    className="flex w-full items-center justify-center gap-2 border border-foreground bg-transparent px-8 py-4 text-xs font-medium tracking-widest text-foreground uppercase transition-all duration-300 hover:bg-foreground hover:text-background active:scale-[0.98]"
                  >
                    Contact Your Advisor
                  </button>

                  {/* Find in Store */}
                  <button
                    id="find-in-store-btn"
                    className="mt-2 flex w-full items-center justify-center gap-2 py-3 text-foreground transition-opacity hover:opacity-60"
                  >
                    <MapPin className="h-4 w-4" strokeWidth={1.25} />
                    <span className="text-xs font-medium tracking-widest uppercase">
                      Find in Store
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========== RIGHT COLUMN — SCROLLABLE ========== */}
          <div className="order-1 lg:order-2">
            {/* Hero product image */}
            <div className="relative bg-secondary">
              <div className="flex aspect-square items-center justify-center p-12 md:aspect-[4/3] md:p-20 lg:aspect-auto lg:min-h-[75vh] lg:p-24">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full max-h-[600px] w-auto object-contain transition-transform duration-700 hover:scale-105"
                />
              </div>
              {/* Scroll to discover */}
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground">
                <span className="text-[11px] tracking-widest uppercase">Scroll to discover</span>
                <ChevronDown className="h-4 w-4 animate-bounce" strokeWidth={1.25} />
              </div>
            </div>

            {/* Description area */}
            <div className="px-6 py-14 md:px-12 lg:px-16 lg:py-20">
              <div className="mx-auto max-w-2xl">
                {/* PayPal notice */}
                <p className="mb-10 text-sm text-muted-foreground">
                  Buy now and pay later with{" "}
                  <span className="font-semibold text-foreground">PayPal</span>.{" "}
                  <Link href="#" className="underline underline-offset-2 transition-opacity hover:opacity-60">
                    Learn more
                  </Link>
                </p>

                {/* Long description */}
                <p className="text-[15px] leading-[1.85] text-foreground">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Product specs row */}
            <div className="border-t border-border px-6 py-10 md:px-12 lg:px-16">
              <div className="mx-auto max-w-2xl">
                <ul className="flex flex-wrap gap-x-12 gap-y-4">
                  {product.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2.5 text-sm text-foreground"
                    >
                      <span className="h-1 w-1 flex-none rounded-full bg-foreground" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* More details toggle */}
            <div className="border-t border-border px-6 md:px-12 lg:px-16">
              <div className="mx-auto max-w-2xl">
                <button
                  onClick={() => setMoreDetailsOpen(!moreDetailsOpen)}
                  className="flex w-full items-center gap-2 py-6 text-sm font-medium text-foreground transition-opacity hover:opacity-60"
                >
                  More details
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-300 ${
                      moreDetailsOpen ? "rotate-90" : ""
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
                {moreDetailsOpen && (
                  <div className="pb-8 text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-3">
                      <p>
                        <span className="font-medium text-foreground">Material:</span>{" "}
                        {product.material}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">SKU:</span>{" "}
                        {product.sku}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Care:</span>{" "}
                        Store in the provided pouch. Avoid contact with perfumes, chemicals, and moisture. Clean gently with a soft cloth.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save / Wishlist row */}
            <div className="border-t border-border px-6 py-6 md:px-12 lg:px-16">
              <div className="mx-auto max-w-2xl">
                <button
                  onClick={() => setWishlist(!wishlist)}
                  className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-60"
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-300 ${
                      wishlist ? "fill-foreground" : ""
                    }`}
                    strokeWidth={1.25}
                  />
                  <span className="text-sm tracking-wide">
                    {wishlist ? "Saved" : "Save"}
                  </span>
                </button>
              </div>
            </div>

            {/* Lifestyle / editorial image */}
            <div className="mt-4">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                <img
                  src="/images/editorial-love.png"
                  alt="Styling inspiration"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <span className="text-xs font-medium tracking-widest uppercase">
                    The {product.collection} Collection
                  </span>
                  <h3 className="mt-3 max-w-md px-4 font-serif text-3xl text-balance md:text-4xl">
                    Discover the Full Collection
                  </h3>
                  <Link
                    href="#"
                    className="mt-5 inline-block border-b border-white pb-0.5 text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-80"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>

            {/* Second editorial image */}
            <div>
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                <img
                  src="/images/editorial-watch.png"
                  alt="Craftsmanship"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <span className="text-xs font-medium tracking-widest uppercase">
                    Craftsmanship
                  </span>
                  <h3 className="mt-3 max-w-md px-4 font-serif text-3xl text-balance md:text-4xl">
                    The Art Behind Every Piece
                  </h3>
                  <Link
                    href="#"
                    className="mt-5 inline-block border-b border-white pb-0.5 text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-80"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Related Products ===== */}
      {related.length > 0 && (
        <section className="border-t border-border bg-background py-16 md:py-24">
          <div className="mx-auto max-w-[1600px] px-6 md:px-10">
            <h2 className="mb-12 text-center font-serif text-3xl text-foreground text-balance md:text-4xl">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="group block"
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden bg-secondary p-6">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-5 text-center">
                    <p className="font-serif text-lg text-foreground">
                      {item.collection}
                    </p>
                    <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground group-hover:underline">
                      {item.name}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {item.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Complimentary Services Banner ===== */}
      <section className="border-t border-border bg-secondary">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-0 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            {
              title: "Complimentary Gift Wrapping",
              desc: "Each piece arrives in our signature packaging, ready to delight.",
            },
            {
              title: "Free Shipping & Returns",
              desc: "Enjoy complimentary shipping on all orders with easy returns.",
            },
            {
              title: "Expert Guidance",
              desc: "Our advisors are available to help you find the perfect piece.",
            },
          ].map((svc) => (
            <div key={svc.title} className="px-8 py-10 text-center md:py-14">
              <h3 className="text-xs font-semibold tracking-widest text-foreground uppercase">
                {svc.title}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <TiffanyFooter />
    </main>
  )
}
