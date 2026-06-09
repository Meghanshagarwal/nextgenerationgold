import { NggHeader } from "@/components/ngg-header"
import { NggHero } from "@/components/ngg-hero"
import { NggCategories } from "@/components/ngg-categories"
import { NggEditorial } from "@/components/ngg-editorial"
import { NggNewJewelry } from "@/components/ngg-new-jewelry"
import { NggWorld } from "@/components/ngg-world"
import { NggFooter } from "@/components/ngg-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <NggHeader />
      <NggHero />
      <NggCategories />
      <NggEditorial />
      <NggNewJewelry />
      <NggWorld />
      <NggFooter />
    </main>
  )
}
