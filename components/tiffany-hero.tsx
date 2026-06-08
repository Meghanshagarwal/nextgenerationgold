import Link from "next/link"

export function TiffanyHero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/8] lg:aspect-[16/7]">
        <img
          src="/images/hero.png"
          alt="Elegant woman in a black turtleneck smiling, with a twilight cityscape and a stained glass lamp in the background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center sm:items-start sm:pb-16 sm:pl-12 sm:text-left lg:pb-20 lg:pl-20">
          <h1 className="max-w-md font-serif text-4xl leading-tight text-white text-balance drop-shadow-sm sm:text-5xl lg:text-6xl">
            With Love, Since 1837
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90 drop-shadow-sm sm:text-base">
            Discover the icons that have defined a legacy of extraordinary design.
          </p>
          <Link
            href="#"
            className="mt-6 inline-block bg-white px-8 py-3 text-xs font-medium tracking-widest text-foreground uppercase transition-opacity hover:opacity-80"
          >
            Explore the Collection
          </Link>
        </div>
      </div>
    </section>
  )
}
