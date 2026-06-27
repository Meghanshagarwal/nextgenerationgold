"use client"

import { useEffect, useState } from "react"
import { NggHeader } from "@/components/ngg-header"
import { NggHero } from "@/components/ngg-hero"
import { NggCategories } from "@/components/ngg-categories"
import { NggEditorial } from "@/components/ngg-editorial"
import { NggNewJewelry } from "@/components/ngg-new-jewelry"
import { NggWorld } from "@/components/ngg-world"
import { NggFooter } from "@/components/ngg-footer"

export default function Page() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHomeSettings() {
      try {
        const res = await fetch("/api/home-page", { cache: "no-store" })
        if (res.ok) {
          setSettings(await res.json())
        }
      } catch (e) {
        console.error("Failed to load homepage settings:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeSettings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-[#9A7B4F] border-r-2 border-r-transparent" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <NggHeader />
      <NggHero data={settings?.hero} />
      <NggCategories data={settings?.categories} />
      <NggEditorial data1={settings?.editorial1} data2={settings?.editorial2} />
      <NggNewJewelry />
      <NggWorld data={settings?.world} />
      <NggFooter />
    </main>
  )
}
