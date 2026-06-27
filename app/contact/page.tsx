"use client"

import { useState, useEffect } from "react"
import { NggHeader } from "@/components/ngg-header"
import { NggFooter } from "@/components/ngg-footer"
import { Mail, Phone, Globe } from "lucide-react"

export default function ContactPage() {
  // About Us settings data (fallback to default)
  const [aboutUs, setAboutUs] = useState({
    companyEmail: "concierge@nextgenerationgold.com",
    companyPhone: "0800-100-2070 (10:00 - 18:00)",
    companyWebsite: "https://nextgenerationgold.com"
  })

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    message: ""
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Fetch About Us settings for contact details on mount
  useEffect(() => {
    async function fetchContactDetails() {
      try {
        const res = await fetch("/api/about-us")
        if (res.ok) {
          const data = await res.json()
          setAboutUs({
            companyEmail: data.companyEmail || "concierge@nextgenerationgold.com",
            companyPhone: data.companyPhone || "0800-100-2070 (10:00 - 18:00)",
            companyWebsite: data.companyWebsite || "https://nextgenerationgold.com"
          })
        }
      } catch (e) {
        console.error("Failed to load contact info from About Us:", e)
      }
    }
    fetchContactDetails()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const fullName = `${formData.name} ${formData.surname}`.trim()

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          subject: "Collaborations & Inquiries",
          type: "contact"
        })
      })

      if (res.ok) {
        setSuccess("Thank you! Your inquiry has been submitted successfully.")
        setFormData({
          name: "",
          surname: "",
          phone: "",
          email: "",
          message: ""
        })
      } else {
        const data = await res.json()
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch (e) {
      setError("Failed to submit inquiry. Please check your network connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <NggHeader />

      <section className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: Contact Information Card */}
          <div className="lg:col-span-4 bg-[#FAF2F0] p-8 md:p-12 rounded-3xl flex flex-col justify-between min-h-[500px]">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-[#1C1C1C] font-semibold tracking-wide">
                Contact Information
              </h2>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Please feel free to contact us with any questions or inquiries about collaborations.
              </p>

              <div className="mt-12 flex flex-col gap-6">
                {/* Email detail */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-white text-[#7D1A25] shadow-xs">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold font-sans">Email Us</span>
                    <p className="text-[#1C1C1C] text-sm font-medium mt-0.5 break-all">
                      <a href={`mailto:${aboutUs.companyEmail}`} className="hover:underline">{aboutUs.companyEmail}</a>
                    </p>
                  </div>
                </div>

                {/* Phone detail */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-white text-[#7D1A25] shadow-xs">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold font-sans">Call Us</span>
                    <p className="text-[#1C1C1C] text-sm font-medium mt-0.5">{aboutUs.companyPhone}</p>
                  </div>
                </div>

                {/* Website detail */}
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-white text-[#7D1A25] shadow-xs">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold font-sans">Visit Website</span>
                    <p className="text-[#1C1C1C] text-sm font-medium mt-0.5 break-all">
                      <a href={aboutUs.companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {aboutUs.companyWebsite}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Icons row */}
            <div className="mt-12 pt-6 border-t border-black/5 flex gap-4">
              <a href="#" className="p-3 bg-white hover:bg-secondary text-[#7D1A25] rounded-full shadow-xs transition-colors" aria-label="Facebook">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" className="p-3 bg-white hover:bg-secondary text-[#7D1A25] rounded-full shadow-xs transition-colors" aria-label="Google">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 5.92 1 12s4.92 11 11.24 11c6.59 0 10.97-4.63 10.97-11.17 0-.75-.08-1.32-.2-1.885H12.24z"/>
                </svg>
              </a>
              <a href="#" className="p-3 bg-white hover:bg-secondary text-[#7D1A25] rounded-full shadow-xs transition-colors" aria-label="X (Twitter)">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Inquiry Form */}
          <div className="lg:col-span-8 flex flex-col gap-6 justify-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-[#1C1C1C] font-semibold tracking-wide lowercase first-letter:uppercase">
                inquiry
              </h2>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Please feel free to contact us with any questions or inquiries about collaborations.
              </p>
            </div>

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg font-semibold">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-lg font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-muted-foreground tracking-wider font-sans">
                    name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-[#EAEAEA] px-5 py-3.5 text-xs text-foreground placeholder:text-muted-foreground bg-white focus:outline-none focus:border-[#9A7B4F] rounded-xl transition-all font-sans"
                    required
                  />
                </div>

                {/* Surname */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-muted-foreground tracking-wider font-sans">
                    surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="w-full border border-[#EAEAEA] px-5 py-3.5 text-xs text-foreground placeholder:text-muted-foreground bg-white focus:outline-none focus:border-[#9A7B4F] rounded-xl transition-all font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mobile number */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-muted-foreground tracking-wider font-sans">
                    mobile number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your mobile phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-[#EAEAEA] px-5 py-3.5 text-xs text-foreground placeholder:text-muted-foreground bg-white focus:outline-none focus:border-[#9A7B4F] rounded-xl transition-all font-sans"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-muted-foreground tracking-wider font-sans">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-[#EAEAEA] px-5 py-3.5 text-xs text-foreground placeholder:text-muted-foreground bg-white focus:outline-none focus:border-[#9A7B4F] rounded-xl transition-all font-sans"
                    required
                  />
                </div>
              </div>

              {/* Inquiry details */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-medium text-muted-foreground tracking-wider font-sans">
                  Inquiry details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Enter your information here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-[#EAEAEA] px-5 py-4 text-xs text-foreground placeholder:text-muted-foreground bg-white focus:outline-none focus:border-[#9A7B4F] rounded-2xl transition-all resize-none leading-relaxed font-sans"
                  required
                />
              </div>

              {/* Submit button */}
              <div className="flex justify-start mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#7D1A25] hover:bg-[#63141D] text-white px-10 py-3.5 text-xs font-semibold uppercase tracking-widest transition-all rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 select-none font-sans"
                >
                  {loading ? "sending..." : "send"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      <NggFooter />
    </main>
  )
}
