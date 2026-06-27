"use client"

import { useEffect, useState } from "react"
import { NggHeader } from "@/components/ngg-header"
import { NggFooter } from "@/components/ngg-footer"
import { Mail, Phone, Globe, Calendar, Briefcase, Landmark, ShieldCheck, Share2, Compass } from "lucide-react"

type AboutUsData = {
  beginningTitle: string
  beginningText: string
  beginningImage: string
  visionTitle: string
  visionText: string
  visionImage: string
  missionTitle: string
  missionText: string
  missionImage: string
  companyName: string
  companyEmail: string
  companyPhone: string
  companyWebsite: string
  setupDate: string
  capital: string
  businessContent: string
}

export default function AboutUsPage() {
  const [data, setData] = useState<AboutUsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const res = await fetch("/api/about-us", { cache: "no-store" })
        if (res.ok) {
          setData(await res.json())
        }
      } catch (e) {
        console.error("Failed to load about us details", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAboutData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-[#9A7B4F] border-r-2 border-r-transparent" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-foreground flex flex-col justify-between">
      <div>
        <NggHeader />
        
        {/* Breadcrumb Spacer */}
        <div className="pt-32 lg:pt-40 max-w-7xl mx-auto px-6 sm:px-12">
          <nav className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
            <a href="/" className="hover:text-[#9A7B4F] transition-colors">Home</a>
            <span>/</span>
            <span className="text-[#9A7B4F]">About Us</span>
          </nav>
        </div>

        {/* SECTION 1: Beginning */}
        <section id="story" className="max-w-7xl mx-auto px-6 sm:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="overflow-hidden rounded shadow-md border border-[#EAEAEA] bg-white">
              <img 
                src={data.beginningImage} 
                alt="The Beginning of Next Generation Gold" 
                className="w-full h-[320px] md:h-[400px] object-cover hover:scale-[1.02] transition-transform duration-500" 
              />
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-[10px] uppercase tracking-widest text-[#9A7B4F] font-bold">Origin Story</span>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1C1C1C] leading-tight font-semibold tracking-wide">
                {data.beginningTitle}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                {data.beginningText}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Vision & Mission (experience) & Company Info */}
        <section className="border-t border-[#EAEAEA] bg-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Side: Company Card */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="border border-[#FAF6F0] bg-[#FAF9F6] p-8 rounded shadow-xs flex flex-col gap-6">
                  {/* Badge & Logo */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#9A7B4F] text-white flex items-center justify-center font-serif text-sm font-bold tracking-wider rounded">NGG</div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">{data.companyName}</h4>
                      <p className="text-[9px] text-[#9A7B4F] font-bold tracking-widest uppercase mt-0.5">Headquarters</p>
                    </div>
                  </div>

                  <hr className="border-[#EBE3D5]" />

                  {/* Contacts */}
                  <div className="flex flex-col gap-3.5 text-xs text-muted-foreground font-semibold">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[#9A7B4F]" />
                      <a href={`mailto:${data.companyEmail}`} className="hover:text-[#9A7B4F] transition-colors">{data.companyEmail}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-[#9A7B4F]" />
                      <span>{data.companyPhone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-[#9A7B4F]" />
                      <a href={data.companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-[#9A7B4F] transition-colors">{data.companyWebsite.replace("https://", "")}</a>
                    </div>
                  </div>

                  <hr className="border-[#EBE3D5]" />

                  {/* Basic Info */}
                  <div className="flex flex-col gap-4">
                    <h5 className="text-[10px] text-[#1C1C1C] uppercase tracking-widest font-bold">Basic Information</h5>
                    
                    <div className="flex items-start gap-3.5 text-xs">
                      <Calendar className="h-4 w-4 text-[#9A7B4F] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Set up</p>
                        <p className="text-[#1C1C1C] font-semibold mt-0.5">{data.setupDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Vision & Mission Details */}
              <div className="lg:col-span-8 flex flex-col gap-12">
                {/* Vision block */}
                <div id="vision" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-[#EAEAEA] pb-12">
                  <div className="md:col-span-8 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A7B4F] font-bold">Future Outlook</span>
                    <h2 className="font-serif text-3xl text-[#1C1C1C] font-semibold tracking-wide">
                      {data.visionTitle}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                      {data.visionText}
                    </p>
                  </div>
                  <div className="md:col-span-4 overflow-hidden rounded border border-[#EAEAEA]">
                    <img 
                      src={data.visionImage || "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80"} 
                      alt="Our Vision" 
                      className="w-full h-32 md:h-40 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Mission block */}
                <div id="mission" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                  <div className="md:col-span-4 overflow-hidden rounded border border-[#EAEAEA]">
                    <img 
                      src={data.missionImage} 
                      alt="Our Mission" 
                      className="w-full h-32 md:h-40 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="md:col-span-8 flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#9A7B4F] font-bold">Our Philosophy</span>
                    <h2 className="font-serif text-3xl text-[#1C1C1C] font-semibold tracking-wide">
                      {data.missionTitle}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                      {data.missionText}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
      
      <NggFooter />
    </div>
  )
}
