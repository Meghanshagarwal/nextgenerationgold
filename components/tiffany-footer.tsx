import Link from "next/link"

const footerColumns = [
  {
    title: "Customer Service",
    links: ["Contact Us", "FAQs", "Track Your Order", "Shipping & Returns", "Product Care"],
  },
  {
    title: "About Next Generation Gold",
    links: ["Our Story", "Sustainability", "Careers", "Newsroom", "Diamond Source"],
  },
  {
    title: "Services",
    links: ["Book an Appointment", "Engraving", "Repairs", "Store Locator", "Gift Wrapping"],
  },
]

export function TiffanyFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-10">
        {/* Newsletter */}
        <div className="mx-auto max-w-xl text-center">
          <h3 className="font-serif text-2xl md:text-3xl">Stay in Touch</h3>
          <p className="mt-3 text-sm leading-relaxed text-background/70">
            Sign up to receive the latest from Next Generation Gold, including new arrivals and exclusive events.
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Email Address"
              aria-label="Email Address"
              className="flex-1 border border-background/30 bg-transparent px-4 py-3 text-sm text-background placeholder:text-background/50 focus:border-background focus:outline-none"
            />
            <button
              type="submit"
              className="bg-background px-8 py-3 text-xs font-medium tracking-widest text-foreground uppercase transition-opacity hover:opacity-80"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Link columns */}
        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-background/20 pt-12 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-xs font-semibold tracking-widest uppercase">{column.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-background/70 transition-colors hover:text-background">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-center md:flex-row md:text-left">
          <span className="font-serif text-2xl tracking-tight">NEXT GENERATION GOLD</span>
          <p className="text-xs text-background/60">
            &copy; {new Date().getFullYear()} Next Generation Gold. All Rights Reserved.
          </p>
          <div className="flex gap-5 text-xs text-background/60">
            <Link href="#" className="transition-colors hover:text-background">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-background">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-background">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
