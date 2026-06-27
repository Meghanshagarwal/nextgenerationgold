import Link from "next/link"

interface NggHeroProps {
  data?: {
    image: string
    title: string
    description: string
    buttonText: string
    buttonLink: string
  }
}

export function NggHero({ data }: NggHeroProps) {
  // Fallbacks if data is missing
  const heroImage = data?.image || "/images/hero.png"
  const heroTitle = data?.title || "With Love, Since 1837"
  const heroDescription = data?.description || "Discover the icons that have defined a legacy of extraordinary design."
  const heroBtnText = data?.buttonText || "Explore the Collection"
  const heroBtnLink = data?.buttonLink || "/category/jewelry"

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/8] lg:aspect-[16/7]">
        <img
          src={heroImage}
          alt={heroTitle}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center sm:items-start sm:pb-16 sm:pl-12 sm:text-left lg:pb-20 lg:pl-20">
          <h1 className="max-w-md font-serif text-4xl leading-tight text-white text-balance drop-shadow-sm sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90 drop-shadow-sm sm:text-base">
            {heroDescription}
          </p>
          <Link
            href={heroBtnLink}
            className="mt-6 inline-block bg-white px-8 py-3 text-xs font-medium tracking-widest text-foreground uppercase transition-opacity hover:opacity-80 animate-in fade-in duration-300"
          >
            {heroBtnText}
          </Link>
        </div>
      </div>
    </section>
  )
}
