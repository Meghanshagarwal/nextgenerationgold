import Link from "next/link"

export function TiffanyWorld() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/7] lg:aspect-[16/6]">
        <img
          src="/images/world-tiffany.png"
          alt="Next Generation Gold flagship store facade at twilight"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-center">
          <span className="text-xs font-medium tracking-widest text-white/90 uppercase">The World of NGG</span>
          <h2 className="mt-4 max-w-lg px-6 font-serif text-3xl text-white text-balance md:text-5xl">
            A Legacy of Brilliance
          </h2>
          <Link
            href="#"
            className="mt-6 inline-block bg-white px-8 py-3 text-xs font-medium tracking-widest text-foreground uppercase transition-opacity hover:opacity-80"
          >
            Explore Our Story
          </Link>
        </div>
      </div>
    </section>
  )
}
