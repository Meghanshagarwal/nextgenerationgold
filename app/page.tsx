import { TiffanyHeader } from "@/components/tiffany-header"
import { TiffanyHero } from "@/components/tiffany-hero"
import { TiffanyCategories } from "@/components/tiffany-categories"
import { TiffanyEditorial } from "@/components/tiffany-editorial"
import { TiffanyNewJewelry } from "@/components/tiffany-new-jewelry"
import { TiffanyWorld } from "@/components/tiffany-world"
import { TiffanyFooter } from "@/components/tiffany-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <TiffanyHeader />
      <TiffanyHero />
      <TiffanyCategories />
      <TiffanyEditorial />
      <TiffanyNewJewelry />
      <TiffanyWorld />
      <TiffanyFooter />
    </main>
  )
}
