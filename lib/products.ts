export type Product = {
  slug: string
  image: string
  collection: string
  name: string
  price: string
  href: string
  description: string
  details: string[]
  material: string
  sku: string
}

export const products: Product[] = [
  {
    slug: "chain-bracelet-yellow-gold",
    image: "/images/prod-bracelet-yellow.png",
    collection: "Signature Collection",
    name: "Chain Bracelet in Yellow Gold, 11 mm",
    price: "$8,900",
    href: "/product/chain-bracelet-yellow-gold",
    description:
      "Bold and luminous, this 18k yellow gold chain bracelet from the Signature Collection makes a powerful statement. Its substantial 11 mm links catch the light from every angle, transforming an everyday accessory into an heirloom.",
    details: [
      "18k yellow gold",
      "11 mm wide",
      "Lobster clasp closure",
      'Fits wrists up to 7.25"',
    ],
    material: "18k Yellow Gold",
    sku: "NGG-SIG-BR-001",
  },
  {
    slug: "small-double-link-pendant-rose-white-gold",
    image: "/images/prod-pendant-rose.png",
    collection: "HardWear",
    name: "Small Double Link Pendant in Rose and White Gold",
    price: "$3,100",
    href: "/product/small-double-link-pendant-rose-white-gold",
    description:
      "Two interlocking links in contrasting 18k rose and white gold create a striking pendant that symbolises connection. Suspended from a delicate chain, this HardWear piece balances strength and elegance.",
    details: [
      "18k rose and white gold",
      "Pendant: 15 mm × 10 mm",
      'Chain length: 16–18" adjustable',
      "Spring ring clasp",
    ],
    material: "18k Rose & White Gold",
    sku: "NGG-HW-PD-002",
  },
  {
    slug: "micro-link-bracelet-rose-gold",
    image: "/images/prod-link-bracelet.png",
    collection: "HardWear",
    name: "Micro Link Bracelet in Rose Gold",
    price: "$5,500",
    href: "/product/micro-link-bracelet-rose-gold",
    description:
      "Refined yet daring, the HardWear Micro Link Bracelet in 18k rose gold features interlocking graduated links that drape the wrist with fluidity. A modern interpretation of industrial design made precious.",
    details: [
      "18k rose gold",
      "Graduated micro links",
      "Toggle clasp closure",
      'Fits wrists up to 7"',
    ],
    material: "18k Rose Gold",
    sku: "NGG-HW-BR-003",
  },
  {
    slug: "smile-medium-pendant-rose-gold",
    image: "/images/prod-smile-pendant.png",
    collection: "Smile",
    name: "Smile Medium Pendant in Rose Gold with White Mother-of-pearl",
    price: "$2,400",
    href: "/product/smile-medium-pendant-rose-gold",
    description:
      "The iconic Smile arc, rendered in warm 18k rose gold and inlaid with luminous white mother-of-pearl. A joyful silhouette that rests beautifully at the collarbone, radiating optimism and grace.",
    details: [
      "18k rose gold",
      "White mother-of-pearl inlay",
      "Medium arc: 45 mm wide",
      'Chain length: 16–18" adjustable',
    ],
    material: "18k Rose Gold, Mother-of-pearl",
    sku: "NGG-SM-PD-004",
  },
  {
    slug: "smile-medium-bracelet-rose-gold",
    image: "/images/prod-bracelet-yellow.png",
    collection: "Smile",
    name: "Smile Medium Bracelet in Rose Gold with White Mother-of-pearl",
    price: "$2,200",
    href: "/product/smile-medium-bracelet-rose-gold",
    description:
      "The Smile bracelet brings a gentle curve of 18k rose gold to the wrist, accented with a delicate mother-of-pearl inlay. Designed for effortless stacking or as a standalone expression of joy.",
    details: [
      "18k rose gold",
      "White mother-of-pearl inlay",
      "Medium arc: 35 mm wide",
      'Fits wrists up to 6.75"',
    ],
    material: "18k Rose Gold, Mother-of-pearl",
    sku: "NGG-SM-BR-005",
  },
]

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug)
}
