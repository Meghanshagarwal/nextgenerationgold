import Link from "next/link"

interface NggWorldProps {
  data?: {
    image: string
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
  }
}

export function NggWorld({ data }: NggWorldProps) {
  const worldImage = data?.image || "/images/world-ngg.png"
  const worldTitle = data?.title || "A Legacy of Brilliance"
  const worldSubtitle = data?.subtitle || "The World of NGG"
  const worldBtnText = data?.buttonText || "Explore Our Story"
  const worldBtnLink = data?.buttonLink || "/about-us"

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/7] lg:aspect-[16/6]">
        <img
          src={worldImage}
          alt={worldTitle}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-center">
          <span className="text-xs font-medium tracking-widest text-white/90 uppercase">{worldSubtitle}</span>
          <h2 className="mt-4 max-w-lg px-6 font-serif text-3xl text-white text-balance md:text-5xl">
            {worldTitle}
          </h2>
          <Link
            href={worldBtnLink}
            className="mt-6 inline-block bg-white px-8 py-3 text-xs font-medium tracking-widest text-foreground uppercase transition-opacity hover:opacity-80"
          >
            {worldBtnText}
          </Link>
        </div>
      </div>
    </section>
  )
}
