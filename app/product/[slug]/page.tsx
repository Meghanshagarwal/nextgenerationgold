"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MapPin, ChevronRight, Heart, ChevronDown, X, ChevronLeft } from "lucide-react"
import { NggHeader } from "@/components/ngg-header"
import { NggFooter } from "@/components/ngg-footer"
import { getProduct, products, Product } from "@/lib/products"

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeImage, setActiveImage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          const allProducts: Product[] = await res.json()
          const found = allProducts.find(p => p.slug === slug)
          if (found) {
            setProduct(found)
            setRelated(allProducts.filter(p => p.collection === found.collection && p.slug !== found.slug))
            setFormData({
              name: "",
              email: "",
              subject: `Inquiry: NGG ${found.collection} - ${found.name}`,
              message: `Dear Advisor,\n\nI am interested in learning more about the NGG ${found.collection} - ${found.name} (${found.price}). Please contact me at your earliest convenience.`
            })
            setLoading(false)
            return
          }
        }
      } catch (e) {
        console.error("API fetch failed, falling back to static data", e)
      }
      
      const found = getProduct(slug)
      if (found) {
        setProduct(found)
        setRelated(products.filter(p => p.collection === found.collection && p.slug !== found.slug))
        setFormData({
          name: "",
          email: "",
          subject: `Inquiry: NGG ${found.collection} - ${found.name}`,
          message: `Dear Advisor,\n\nI am interested in learning more about the NGG ${found.collection} - ${found.name} (${found.price}). Please contact me at your earliest convenience.`
        })
      }
      setLoading(false)
    }
    
    loadProduct()
  }, [slug])

  useEffect(() => {
    if (product) {
      setActiveImage(product.image)
    }
  }, [product])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productInterest: product?.name
        })
      })
      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setContactModalOpen(false)
          setSubmitted(false)
          setFormData(prev => ({
            ...prev,
            name: "",
            email: ""
          }))
        }, 2000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <NggHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-t border-foreground" />
        </div>
        <NggFooter />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <NggHeader />
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
        <NggFooter />
      </main>
    )
  }


  return (
    <main className="min-h-screen bg-background">
      <NggHeader />

      {/* ===== Product Section — Two Column Layout ===== */}
      <section className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr]">

          {/* ========== LEFT COLUMN — STICKY ========== */}
          <div className="order-2 border-r border-border lg:order-1">
            <div className="lg:sticky lg:top-[var(--header-height,132px)] lg:h-[calc(100vh-var(--header-height,132px))] lg:overflow-y-auto lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden transition-[top,height] duration-300 ease-in-out">
              <div className="px-6 py-10 md:px-10 lg:py-14">
                {/* Collection name */}
                <h1 className="font-serif text-2xl text-foreground md:text-[28px] leading-tight">
                  NGG {product.collection}
                </h1>

                {/* Product name */}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {product.name}
                </p>

                {/* Category & Product Type badges */}
                {(product.category || product.productType) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {product.category && product.category.split(',').map(c => c.trim()).filter(Boolean).map((cat, i) => (
                      <span key={i} className="inline-block px-3 py-1 text-[10px] font-semibold tracking-widest uppercase border border-[#9A7B4F]/30 text-[#9A7B4F] bg-[#9A7B4F]/5 rounded-full">
                        {cat}
                      </span>
                    ))}
                    {product.productType && (
                      <span className="inline-block px-3 py-1 text-[10px] font-semibold tracking-widest uppercase border border-border text-muted-foreground bg-secondary rounded-full">
                        {product.productType}
                      </span>
                    )}
                  </div>
                )}

                {/* Short Description */}
                {product.shortDescription && (
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground italic">
                    {product.shortDescription}
                  </p>
                )}

                {/* Price */}
                <p className="mt-6 text-base text-foreground">{product.price}</p>

                {/* Stock status badge */}
                {product.stockStatus && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${product.stockStatus.toLowerCase().includes('in stock') ? 'bg-emerald-500' : product.stockStatus.toLowerCase().includes('order') ? 'bg-amber-500' : 'bg-red-400'}`} />
                    <span className="text-[11px] tracking-wide text-muted-foreground">{product.stockStatus}</span>
                  </div>
                )}

                {/* Styling Suggestion */}
                {product.styling && (
                  <div className="mt-6 border-t border-border pt-5">
                    <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">Styling</h3>
                    <p className="text-xs leading-relaxed text-foreground">{product.styling}</p>
                  </div>
                )}

                {/* Occasions */}
                {product.occasions && (
                  <div className="mt-4 border-t border-border pt-5">
                    <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">Perfect For</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {product.occasions.split(',').map(o => o.trim()).filter(Boolean).map((occ, i) => (
                        <span key={i} className="inline-block px-2.5 py-1 text-[10px] tracking-wide border border-border text-foreground bg-secondary/50 rounded-full">
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4 border-t border-border pt-5">
                    <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag, i) => (
                        <span key={i} className="inline-block px-2.5 py-1 text-[10px] tracking-wide text-muted-foreground bg-[#F5F3EF] rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-3">

                  {/* Contact Advisor */}
                  <button
                    id="contact-advisor-btn"
                    onClick={() => setContactModalOpen(true)}
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
            <div className="relative bg-secondary group">
              <div className="relative flex aspect-square items-center justify-center p-12 md:aspect-[4/3] md:p-20 lg:aspect-auto lg:min-h-[70vh] lg:p-24">
                <img
                  src={activeImage || product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full max-h-[550px] w-auto object-contain transition-transform duration-700 hover:scale-105"
                />

                {/* Left/Right Navigation Arrows overlay */}
                {(() => {
                  const allImages = [product.image, ...(product.images || [])].filter(Boolean)
                  if (allImages.length <= 1) return null

                  const currentIndex = allImages.indexOf(activeImage)
                  
                  const handlePrev = () => {
                    const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length
                    setActiveImage(allImages[prevIdx])
                  }

                  const handleNext = () => {
                    const nextIdx = (currentIndex + 1) % allImages.length
                    setActiveImage(allImages[nextIdx])
                  }

                  return (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground p-3 rounded-full border border-border transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground p-3 rounded-full border border-border transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    </>
                  )
                })()}
              </div>

              {/* Gallery Thumbnails List */}
              {(() => {
                const allImages = [product.image, ...(product.images || [])].filter(Boolean)
                if (allImages.length <= 1) return null

                return (
                  <div className="flex items-center justify-center gap-3 px-6 pb-8 -mt-4 overflow-x-auto">
                    {allImages.map((imgUrl, idx) => {
                      const isActive = imgUrl === activeImage
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveImage(imgUrl)}
                          className={`relative w-16 h-16 aspect-square bg-white border rounded overflow-hidden p-1 transition-all duration-300 hover:scale-105 shrink-0 ${
                            isActive ? "border-[#9A7B4F] ring-1 ring-[#9A7B4F]" : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                        </button>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Scroll to discover */}
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground">
                <span className="text-[11px] tracking-widest uppercase">Scroll to discover</span>
                <ChevronDown className="h-4 w-4 animate-bounce" strokeWidth={1.25} />
              </div>
            </div>

            {/* Description area */}
            <div className="px-6 py-14 md:px-12 lg:px-16 lg:py-20">
              <div className="mx-auto max-w-2xl">

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

            {/* Product Specifications */}
            <div className="border-t border-border px-6 py-10 md:px-12 lg:px-16">
              <div className="mx-auto max-w-2xl">
                <h3 className="font-serif text-xl text-foreground mb-8">Product Specifications</h3>
                <div className="flex flex-col gap-6">
                  
                  {/* Specifications Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Metal details */}
                    {(product.metalType || product.goldPurity || product.goldColor || product.grossWeight || product.netGoldWeight) ? (
                      <div className="flex flex-col gap-2">
                        <h4 className="font-serif font-semibold text-foreground text-xs uppercase tracking-wider">Metal Details</h4>
                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                          {product.metalType && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Metal:</span><span className="font-medium text-foreground text-right">{product.metalType}</span></div>}
                          {product.goldPurity && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Purity:</span><span className="font-medium text-foreground text-right">{product.goldPurity}</span></div>}
                          {product.goldColor && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Color:</span><span className="font-medium text-foreground text-right">{product.goldColor}</span></div>}
                          {product.grossWeight && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Gross Weight:</span><span className="font-medium text-foreground text-right">{product.grossWeight} g</span></div>}
                          {product.netGoldWeight && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Net Gold Weight:</span><span className="font-medium text-foreground text-right">{product.netGoldWeight} g</span></div>}
                        </div>
                      </div>
                    ) : null}

                    {/* Diamond Details */}
                    {(product.diamondType || product.totalDiamondWeight || product.diamondShape || product.diamondColor || product.diamondClarity || product.numberOfDiamonds) ? (
                      <div className="flex flex-col gap-2">
                        <h4 className="font-serif font-semibold text-foreground text-xs uppercase tracking-wider">Diamond Specifications</h4>
                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                          {product.diamondType && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Type:</span><span className="font-medium text-foreground text-right">{product.diamondType}</span></div>}
                          {product.totalDiamondWeight && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Total Weight:</span><span className="font-medium text-foreground text-right">{product.totalDiamondWeight} CTS</span></div>}
                          {product.diamondShape && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Shape:</span><span className="font-medium text-foreground text-right">{product.diamondShape}</span></div>}
                          {product.diamondColor && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Color Grade:</span><span className="font-medium text-foreground text-right">{product.diamondColor}</span></div>}
                          {product.diamondClarity && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Clarity:</span><span className="font-medium text-foreground text-right">{product.diamondClarity}</span></div>}
                          {product.numberOfDiamonds && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Count:</span><span className="font-medium text-foreground text-right">{product.numberOfDiamonds}</span></div>}
                        </div>
                      </div>
                    ) : null}

                    {/* Gemstone Details */}
                    {(product.gemstoneType || product.gemstoneShape || product.gemstoneSize || product.totalGemstoneWeight || product.numberOfGemstones) ? (
                      <div className="flex flex-col gap-2">
                        <h4 className="font-serif font-semibold text-foreground text-xs uppercase tracking-wider">Gemstone Specifications</h4>
                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                          {product.gemstoneType && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Type:</span><span className="font-medium text-foreground text-right">{product.gemstoneType}</span></div>}
                          {product.gemstoneShape && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Shape:</span><span className="font-medium text-foreground text-right">{product.gemstoneShape}</span></div>}
                          {product.gemstoneSize && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Size:</span><span className="font-medium text-foreground text-right">{product.gemstoneSize}</span></div>}
                          {product.totalGemstoneWeight && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Total Weight:</span><span className="font-medium text-foreground text-right">{product.totalGemstoneWeight} CTS</span></div>}
                          {product.numberOfGemstones && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Count:</span><span className="font-medium text-foreground text-right">{product.numberOfGemstones}</span></div>}
                        </div>
                      </div>
                    ) : null}

                    {/* Dimensions & Sizing */}
                    {(product.dimensions || product.ringSize || product.necklaceLength) ? (
                      <div className="flex flex-col gap-2">
                        <h4 className="font-serif font-semibold text-foreground text-xs uppercase tracking-wider">Sizing & Measurements</h4>
                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                          {product.dimensions && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Dimensions:</span><span className="font-medium text-foreground text-right">{product.dimensions}</span></div>}
                          {product.ringSize && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Ring Size:</span><span className="font-medium text-foreground text-right">{product.ringSize}</span></div>}
                          {product.necklaceLength && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Necklace Length:</span><span className="font-medium text-foreground text-right">{product.necklaceLength}</span></div>}
                        </div>
                      </div>
                    ) : null}

                    {/* Logistics & Registry */}
                    <div className="flex flex-col gap-2">
                      <h4 className="font-serif font-semibold text-foreground text-xs uppercase tracking-wider">Registry & Integrity</h4>
                      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        {product.sku && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>SKU:</span><span className="font-mono font-medium text-foreground text-right">{product.sku}</span></div>}
                        {product.material && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Material Value:</span><span className="font-medium text-foreground text-right">{product.material}</span></div>}
                        {product.certification && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Certification:</span><span className="font-medium text-foreground text-right">{product.certification}</span></div>}
                        {product.hallmarkDetails && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Hallmarking:</span><span className="font-medium text-foreground text-right">{product.hallmarkDetails}</span></div>}
                      </div>
                    </div>

                    {/* Shipping & Production */}
                    {(product.stockStatus || product.productionTime || product.shippingInfo || product.origin || product.treatment) ? (
                      <div className="flex flex-col gap-2">
                        <h4 className="font-serif font-semibold text-foreground text-xs uppercase tracking-wider">Availability & Logistics</h4>
                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                          {product.stockStatus && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Status:</span><span className="font-medium text-foreground text-right">{product.stockStatus}</span></div>}
                          {product.productionTime && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Production Time:</span><span className="font-medium text-foreground text-right">{product.productionTime}</span></div>}
                          {product.shippingInfo && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Shipping:</span><span className="font-medium text-foreground text-right">{product.shippingInfo}</span></div>}
                          {product.origin && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Origin:</span><span className="font-medium text-foreground text-right">{product.origin}</span></div>}
                          {product.treatment && <div className="flex justify-between py-1 border-b border-[#F5F5F5] gap-4"><span>Treatment:</span><span className="font-medium text-foreground text-right">{product.treatment}</span></div>}
                        </div>
                      </div>
                    ) : null}

                  </div>

                  {/* Care instructions */}
                  <div className="border-t border-[#F5F5F5] pt-6 flex flex-col gap-2">
                    <span className="font-serif font-semibold text-foreground text-xs uppercase tracking-wider">Care Instructions</span>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Store in the provided luxury pouch. Avoid direct contact with abrasive surfaces, perfumes, chemicals, and moisture. Clean gently using a soft polishing cloth.
                    </p>
                  </div>

                </div>
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

      <NggFooter />

      {/* Contact Advisor Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setContactModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-background p-8 border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setContactModalOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-2">Message Sent</h3>
                <p className="text-sm text-muted-foreground">An advisor will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
                <div>
                  <h3 className="font-serif text-2xl text-foreground">Contact Advisor</h3>
                  <p className="text-xs text-muted-foreground mt-1">Please fill out the form below to speak with an advisor.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 flex w-full items-center justify-center bg-foreground py-4 text-xs font-medium tracking-widest text-background uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
