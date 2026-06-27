import Link from "next/link"

interface EditorialBlockData {
  eyebrow: string
  title: string
  description: string
  image: string
}

interface EditorialProps {
  eyebrow: string
  title: string
  description: string
  image: string
  reverse?: boolean
}

function EditorialBlock({ eyebrow, title, description, image, reverse }: EditorialProps) {
  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={`relative aspect-[4/3] w-full overflow-hidden bg-muted ${reverse ? "lg:order-2" : ""}`}>
        <img src={image || "/placeholder.svg"} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className={`flex flex-col items-start ${reverse ? "lg:order-1 lg:items-end lg:text-right" : ""}`}>
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">{eyebrow}</span>
        <h3 className="mt-4 max-w-md font-serif text-3xl text-foreground text-balance md:text-4xl">{title}</h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>
        <Link
          href="#"
          className="mt-6 inline-block border-b border-foreground pb-0.5 text-xs font-medium tracking-widest uppercase transition-opacity hover:opacity-60"
        >
          Discover More
        </Link>
      </div>
    </div>
  )
}

interface NggEditorialProps {
  data1?: EditorialBlockData
  data2?: EditorialBlockData
}

export function NggEditorial({ data1, data2 }: NggEditorialProps) {
  const block1 = {
    eyebrow: data1?.eyebrow || "Timepieces",
    title: data1?.title || "The Art of Time",
    description: data1?.description || "Masterfully crafted watches that blend precision engineering with timeless elegance, designed to be cherished for generations.",
    image: data1?.image || "/images/editorial-watch.png"
  }

  const block2 = {
    eyebrow: data2?.eyebrow || "Love & Engagement",
    title: data2?.title || "A Promise Made to Last",
    description: data2?.description || "From the first spark to forever, celebrate your story with rings as extraordinary as your love. Each one a testament to enduring craftsmanship.",
    image: data2?.image || "/images/editorial-love.png"
  }

  return (
    <section className="bg-secondary">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-20 px-6 py-20 md:px-10 md:py-28">
        <EditorialBlock
          eyebrow={block1.eyebrow}
          title={block1.title}
          description={block1.description}
          image={block1.image}
        />
        <EditorialBlock
          eyebrow={block2.eyebrow}
          title={block2.title}
          description={block2.description}
          image={block2.image}
          reverse
        />
      </div>
    </section>
  )
}
