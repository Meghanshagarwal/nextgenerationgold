"use client"

import { useState } from "react"
import { NggHeader } from "@/components/ngg-header"
import { NggFooter } from "@/components/ngg-footer"
import { ChevronDown, ChevronUp } from "lucide-react"

type TermsSection = {
  title: string
  content: React.ReactNode
}

export default function TermsConditionsPage() {
  const [openSection, setOpenSection] = useState<number | null>(0)

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index)
  }

  const sections: TermsSection[] = [
    {
      title: "Agreement to Terms",
      content: (
        <div className="flex flex-col gap-5 text-sm text-muted-foreground leading-relaxed">
          <h3 className="text-lg font-serif font-semibold text-[#1C1C1C] mt-2">Next Generation Gold Website Terms of Use</h3>
          <p className="text-[11px] uppercase tracking-widest text-[#9A7B4F] font-bold">Last Updated: June 27, 2026</p>
          <p>
            Welcome to Next Generation Gold. These Website Terms of Use (&quot;Terms&quot;) govern your access to and use of nextgenerationgold.com (the &quot;Site&quot;), including any dynamic content, registry services, product listings, and digital consultancies provided by Next Generation Gold (collectively, the &quot;Services&quot;).
          </p>
          <p>
            By accessing or using the Site, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to all of these Terms, please do not access or use our digital catalog services.
          </p>
        </div>
      )
    },
    {
      title: "Intellectual Property Rights",
      content: (
        <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            All content on the Site—including luxury jewelry designs, high-resolution product photography, brand logotypes, custom illustrations, header graphics, interface animations, code scripts, and layout styles—is the intellectual property of Next Generation Gold or our licensors.
          </p>
          <p>
            You are granted a limited, non-exclusive, non-transferable, and revocable license to access the Site solely for personal browsing, boutique appointment inquiries, and non-commercial product registry configuration. Any reproduction, distribution, modification, or commercial exploitation of Site assets without prior written consent from us is strictly prohibited.
          </p>
        </div>
      )
    },
    {
      title: "Product Registry & Custom Quotes",
      content: (
        <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            All prices and specification descriptions displayed in our catalog are subject to verification. Because fine gemstones, conflict-free diamonds, and gold purities require manual artisan calibration, prices listed (e.g. gross weight, net gold weight, diamond shape) represent registry estimates.
          </p>
          <p>
            Next Generation Gold reserves the right to modify product prices, boutique registries, and timepieces configurations at any time. Placing an inquiry or completing a contact form request does not constitute a binding purchase contract; it triggers our boutique concierge appointment follow-up process.
          </p>
        </div>
      )
    },
    {
      title: "Prohibited Uses",
      content: (
        <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            When utilizing the Next Generation Gold Site and Services, you agree not to:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Submit false contact inquiries, fraudulent mobile numbers, or spoofed emails in the contact or chatbot dialog boxes;</li>
            <li>Use automated scrapers, web spiders, or data mining software to harvest catalog details, product images, or pricing tags;</li>
            <li>Infiltrate the database schema, bypass access tokens, or attempt unauthorized entry into the Admin dashboard areas;</li>
            <li>Use the Site in any way that violates applicable state, federal, or international luxury trade regulations.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Limitation of Liability",
      content: (
        <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Next Generation Gold and the NGG Group shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of or inability to access the Services, including but not limited to server response drops, Vercel filesystem exceptions, or database connection delays.
          </p>
          <p>
            The Site and its contents are provided on an &quot;as is&quot; and &quot;as available&quot; basis, without representations or warranties of any kind, either express or implied, including warranties of merchantability or fitness for a particular luxury jewelry purchase.
          </p>
        </div>
      )
    }
  ]

  return (
    <main className="min-h-screen bg-background">
      <NggHeader />

      <section className="mx-auto max-w-[1000px] px-6 py-20 md:py-32">
        {/* Centered Page Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[#1C1C1C] font-semibold tracking-wide">
            Terms and Conditions
          </h1>
        </div>

        {/* Collapsible Accordion Sections */}
        <div className="flex flex-col border-t border-[#EAEAEA]">
          {sections.map((section, idx) => {
            const isOpen = openSection === idx
            return (
              <div key={idx} className="border-b border-[#EAEAEA]">
                <button
                  onClick={() => toggleSection(idx)}
                  className="w-full flex items-center justify-between py-6 text-left hover:text-[#9A7B4F] transition-colors focus:outline-none"
                >
                  <span className="font-serif text-lg md:text-xl text-[#1C1C1C] font-medium tracking-wide">
                    {section.title}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                
                {/* Collapsible Body */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-[800px] pb-8" : "max-h-0"
                  }`}
                >
                  <div className="px-1">{section.content}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <NggFooter />
    </main>
  )
}
