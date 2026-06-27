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
        const res = await fetch("/api/about-us")
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
        <section className="max-w-7xl mx-auto px-6 sm:px-12 py-12 lg:py-16">
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

        {/* SECTION 2: Vision & Company Info */}
        <section className="border-t border-b border-[#EAEAEA] bg-white py-16 lg:py-20">
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
                    
                    <div className="flex items-start gap-3.5 text-xs">
                      <Landmark className="h-4 w-4 text-[#9A7B4F] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Capital</p>
                        <p className="text-[#1C1C1C] font-semibold mt-0.5">{data.capital}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 text-xs">
                      <Briefcase className="h-4 w-4 text-[#9A7B4F] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Business Content</p>
                        <p className="text-[#1C1C1C] font-semibold mt-0.5 leading-normal">{data.businessContent}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Vision Details */}
              <div className="lg:col-span-8 flex flex-col justify-center gap-8">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#9A7B4F] font-bold">Future Outlook</span>
                  <h2 className="font-serif text-3xl md:text-4xl text-[#1C1C1C] font-semibold tracking-wide">
                    {data.visionTitle}
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium max-w-2xl">
                    {data.visionText}
                  </p>
                </div>
                
                {/* Graphics element */}
                <div className="flex items-center gap-4 border border-[#EAEAEA] bg-[#FAF9F6] p-6 rounded max-w-xl">
                  <Compass className="h-10 w-10 text-[#9A7B4F] shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Guided Craftsmanship</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">Navigating a course of ethical materials, standard pricing transparency, and bespoke design.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: Mission */}
        <section className="max-w-7xl mx-auto px-6 sm:px-12 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <span className="text-[10px] uppercase tracking-widest text-[#9A7B4F] font-bold">Our Philosophy</span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#1C1C1C] leading-tight font-semibold tracking-wide">
                {data.missionTitle}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
                {data.missionText}
              </p>
            </div>
            <div className="overflow-hidden rounded shadow-md border border-[#EAEAEA] bg-white order-1 lg:order-2">
              <img 
                src={data.missionImage} 
                alt="Our Mission" 
                className="w-full h-[320px] md:h-[400px] object-cover hover:scale-[1.02] transition-transform duration-500" 
              />
            </div>
          </div>
        </section>
      </div>
      
      <NggFooter />
    </div>
  )
}
