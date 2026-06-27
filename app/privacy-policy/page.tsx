"use client"

import { useState } from "react"
import { NggHeader } from "@/components/ngg-header"
import { NggFooter } from "@/components/ngg-footer"
import { ChevronDown, ChevronUp } from "lucide-react"

type PolicySection = {
  title: string
  content: React.ReactNode
}

export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState<number | null>(0)

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index)
  }

  const sections: PolicySection[] = [
    {
      title: "Introduction",
      content: (
        <div className="flex flex-col gap-5 text-sm text-muted-foreground leading-relaxed">
          <h3 className="text-lg font-serif font-semibold text-[#1C1C1C] mt-2">Next Generation Gold Global Privacy Notice</h3>
          <p className="text-[11px] uppercase tracking-widest text-[#9A7B4F] font-bold">Last Updated: June 27, 2026</p>
          <p>
            We at Next Generation Gold, along with our subsidiaries and affiliates (collectively, the &quot;NGG Group&quot;), respect your concerns about privacy. References in this Global Privacy Notice to &quot;we&quot;, &quot;us&quot;, &quot;our&quot;, &quot;NGG&quot; and &quot;Next Generation Gold&quot; are references to the entity responsible for the processing of your personal information.
          </p>
          <p>
            This Global Privacy Notice describes the types of personal information we collect about our consumers, how we use the information, with whom we share it and the choices available to our consumers regarding our use of the information. We also describe the measures we take to protect the security of the information and how you can contact us about our privacy practices.
          </p>
        </div>
      )
    },
    {
      title: "Information We Collect",
      content: (
        <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            We may collect personal information about you in various ways, such as when you visit our boutiques, use our websites, interact with our mobile applications, communicate with us via telephone or social media, or participate in our exclusive events. The types of personal information we may collect include:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Contact information (such as name, postal address, email address, and mobile phone number);</li>
            <li>Purchase and transaction information (such as payment details, boutique visit history, and registry items);</li>
            <li>Information provided in connection with inquiries or consultant requests (such as size preferences, custom styling requests, and event registry plans);</li>
            <li>Social media details and credentials when interacting with our online features;</li>
            <li>Device geolocation and browsing metrics from your interactions with our online catalog.</li>
          </ul>
        </div>
      )
    },
    {
      title: "How We Use Information",
      content: (
        <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            We may use the information described above for the following business purposes:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>To provide our luxury products and boutique booking services to you;</li>
            <li>To process and fulfill orders, communicate transactions, and manage registry items;</li>
            <li>To respond to your inquiries, consultant requests, and concierge requests;</li>
            <li>To tailor your shopping experience based on interests, tags, and product choices;</li>
            <li>To manage and evaluate our business operations, research collections performance, and enforce legal compliance guidelines.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Sharing Information",
      content: (
        <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            We do not sell or otherwise disclose personal information about you, except as described in this Global Privacy Notice. We may share personal information with:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Our affiliates and subsidiaries within the NGG Group;</li>
            <li>Service providers who perform services on our behalf based on our strict instructions (such as secure transaction gateways, logistics partners, and hosting agencies);</li>
            <li>Law enforcement authorities or governmental entities when required by legal processes or to prevent physical harm or financial loss.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Your Rights & Choices",
      content: (
        <div className="flex flex-col gap-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            We offer you certain choices in connection with the personal information we collect from you, such as how we communicate with you. To update your preferences, ask us to remove your information from our mailing lists or submit a request, please contact our concierge team at <a href="mailto:concierge@nextgenerationgold.com" className="text-[#9A7B4F] hover:underline">concierge@nextgenerationgold.com</a>.
          </p>
          <p>
            Subject to applicable local laws, you may have the right to request access to and receive details about the personal information we maintain about you, update and correct inaccuracies, and have the information blocked or deleted, as appropriate.
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
            Privacy Policy
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
