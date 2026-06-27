import Link from "next/link"

interface CategoryData {
  title: string
  image: string
  href: string
}

interface NggCategoriesProps {
  data?: CategoryData[]
}

const defaultCategories: CategoryData[] = [
  { title: "Jewelry", image: "/images/cat-jewelry.png", href: "/category/jewelry" },
  { title: "Love & Engagement", image: "/images/cat-engagement.png", href: "/category/love-engagement" },
  { title: "Gifts", image: "/images/cat-gifts.png", href: "/category/gifts" },
]

export function NggCategories({ data }: NggCategoriesProps) {
  const categoriesList = data && data.length > 0 ? data : defaultCategories

  return (
    <section className="mx-auto max-w-[1600px] px-6 py-16 md:px-10 md:py-24">
      <h2 className="mb-10 text-center font-serif text-3xl text-foreground text-balance md:text-4xl">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {categoriesList.map((category) => (
          <Link key={category.title} href={category.href} className="group block">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="mt-5 text-center">
              <h3 className="font-serif text-xl text-foreground">{category.title}</h3>
              <span className="mt-2 inline-block border-b border-foreground pb-0.5 text-xs font-medium tracking-widest uppercase">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
