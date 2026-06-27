"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  Package, 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  LayoutDashboard, 
  ArrowLeft,
  X,
  CheckCircle,
  AlertTriangle,
  Star,
  Tags,
  ChevronRight,
  Inbox,
  Info
} from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"
import { Product } from "@/lib/products"
import { ContactSubmission } from "@/lib/db"

type Category = {
  id: string | number
  name: string
  slug: string
}

type Tag = {
  id: string | number
  name: string
  slug: string
}

function AdminPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as any
  
  // Navigation tabs: 'overview' | 'products' | 'categories_tags' | 'contacts' | 'about_us' | 'high_jewelry' | 'jewelry_page' | 'navigation_menu' | 'home_page'
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories_tags" | "contacts" | "about_us" | "high_jewelry" | "jewelry_page" | "navigation_menu" | "home_page">("overview")
  const [products, setProducts] = useState<Product[]>([])
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Categories & Tags Form States
  const [newCatName, setNewCatName] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [catTagError, setCatTagError] = useState("")
  const [catTagSuccess, setCatTagSuccess] = useState("")
  
  // Modals state
  const [deletingProductSlug, setDeletingProductSlug] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null)

  // Inquiries filter & export states
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState<"all" | "contact" | "lead">("all")

  // About Us settings states
  const [aboutUs, setAboutUs] = useState<any>(null)
  const [aboutUsError, setAboutUsError] = useState("")
  const [aboutUsSuccess, setAboutUsSuccess] = useState("")

  // High Jewelry settings states
  const [highJewelry, setHighJewelry] = useState<any>(null)
  const [highJewelryError, setHighJewelryError] = useState("")
  const [highJewelrySuccess, setHighJewelrySuccess] = useState("")

  // Jewelry category page settings states
  const [jewelryPage, setJewelryPage] = useState<any>(null)
  const [jewelryPageError, setJewelryPageError] = useState("")
  const [jewelryPageSuccess, setJewelryPageSuccess] = useState("")

  // Navigation menu settings states
  const [navigationMenu, setNavigationMenu] = useState<any[] | null>(null)
  const [navigationMenuError, setNavigationMenuError] = useState("")
  const [navigationMenuSuccess, setNavigationMenuSuccess] = useState("")

  // Home page settings states
  const [homePage, setHomePage] = useState<any>(null)
  const [homePageError, setHomePageError] = useState("")
  const [homePageSuccess, setHomePageSuccess] = useState("")

  const exportLeadsToCSV = () => {
    const leads = contacts.filter(c => c.type === "lead")
    if (leads.length === 0) {
      alert("No chatbot leads available to export.")
      return
    }
    
    const headers = ["ID", "Name", "Email", "Phone", "City", "Product Interest", "Requirements", "Created At"]
    const rows = leads.map(l => [
      l.id,
      l.name,
      l.email,
      l.phone || "",
      l.city || "",
      l.productInterest || "",
      (l.message || "").replace(/\n/g, " ").replace(/"/g, '""'),
      new Date(l.createdAt).toLocaleString()
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(val => `"${val}"`).join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `ngg_leads_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Sync with search parameter tab on load
  useEffect(() => {
    if (tabParam && ["overview", "products", "categories_tags", "contacts", "about_us", "high_jewelry", "jewelry_page", "navigation_menu", "home_page"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Fetch all database registry items
  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, conRes, catRes, tagRes, aboutRes, hjRes, jpRes, nmRes, hmRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/contacts"),
        fetch("/api/categories"),
        fetch("/api/tags"),
        fetch("/api/about-us"),
        fetch("/api/high-jewelry"),
        fetch("/api/jewelry-page"),
        fetch("/api/navigation-menu"),
        fetch("/api/home-page")
      ])
      
      if (prodRes.ok) setProducts(await prodRes.json())
      if (conRes.ok) setContacts(await conRes.json())
      if (catRes.ok) setCategories(await catRes.json())
      if (tagRes.ok) setTags(await tagRes.json())
      if (aboutRes.ok) setAboutUs(await aboutRes.json())
      if (hjRes.ok) setHighJewelry(await hjRes.json())
      if (jpRes.ok) setJewelryPage(await jpRes.json())
      if (nmRes.ok) setNavigationMenu(await nmRes.json())
      if (hmRes.ok) setHomePage(await hmRes.json())
    } catch (e) {
      console.error("Failed to load admin data:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Confirm Delete Product
  const handleDeleteProduct = async () => {
    if (!deletingProductSlug) return
    try {
      const res = await fetch(`/api/products/${deletingProductSlug}`, {
        method: "DELETE"
      })
      if (res.ok) {
        await loadData()
        setDeletingProductSlug(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Manage Categories & Tags Action Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setCatTagError("")
    setCatTagSuccess("")
    
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() })
      })
      
      if (res.ok) {
        setCatTagSuccess("Category added successfully!")
        setNewCatName("")
        const catData = await fetch("/api/categories").then(r => r.json())
        setCategories(catData)
        setTimeout(() => setCatTagSuccess(""), 2000)
      } else {
        const err = await res.json()
        setCatTagError(err.error || "Failed to create category")
      }
    } catch (e) {
      setCatTagError("Network error. Please try again.")
    }
  }

  const handleDeleteCategory = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this category? Products associated with it will lose their category association.")) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (res.ok) {
        const catData = await fetch("/api/categories").then(r => r.json())
        setCategories(catData)
      }
    } catch (e) {
      console.error("Failed to delete category", e)
    }
  }

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return
    setCatTagError("")
    setCatTagSuccess("")
    
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() })
      })
      
      if (res.ok) {
        setCatTagSuccess("Tag added successfully!")
        setNewTagName("")
        const tagData = await fetch("/api/tags").then(r => r.json())
        setTags(tagData)
        setTimeout(() => setCatTagSuccess(""), 2000)
      } else {
        const err = await res.json()
        setCatTagError(err.error || "Failed to create tag")
      }
    } catch (e) {
      setCatTagError("Network error. Please try again.")
    }
  }

  const handleDeleteTag = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" })
      if (res.ok) {
        const tagData = await fetch("/api/tags").then(r => r.json())
        setTags(tagData)
      }
    } catch (e) {
      console.error("Failed to delete tag", e)
    }
  }

  const handleTabChange = (tab: "overview" | "products" | "categories_tags" | "contacts" | "about_us" | "high_jewelry") => {
    setActiveTab(tab)
    router.replace(`/admin?tab=${tab}`)
  }

  const handleSaveAboutUs = async (e: React.FormEvent) => {
    e.preventDefault()
    setAboutUsError("")
    setAboutUsSuccess("")
    
    try {
      const res = await fetch("/api/about-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutUs)
      })
      
      if (res.ok) {
        setAboutUsSuccess("About Us details updated successfully!")
        setTimeout(() => setAboutUsSuccess(""), 3000)
      } else {
        const err = await res.json()
        const msg = err.fix
          ? `${err.error}\n\nSQL Fix:\n${err.fix}`
          : err.error || "Failed to update details"
        setAboutUsError(msg)
      }
    } catch (e) {
      setAboutUsError("Network error. Please try again.")
    }
  }

  const handleSaveHighJewelry = async (e: React.FormEvent) => {
    e.preventDefault()
    setHighJewelryError("")
    setHighJewelrySuccess("")
    
    try {
      const res = await fetch("/api/high-jewelry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(highJewelry)
      })
      
      if (res.ok) {
        setHighJewelrySuccess("High Jewelry details updated successfully!")
        setTimeout(() => setHighJewelrySuccess(""), 3000)
      } else {
        const err = await res.json()
        const msg = err.fix
          ? `${err.error}\n\nSQL Fix:\n${err.fix}`
          : err.error || "Failed to update details"
        setHighJewelryError(msg)
      }
    } catch (e) {
      setHighJewelryError("Network error. Please try again.")
    }
  }

  const handleSaveJewelryPage = async (e: React.FormEvent) => {
    e.preventDefault()
    setJewelryPageError("")
    setJewelryPageSuccess("")
    
    try {
      const res = await fetch("/api/jewelry-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jewelryPage)
      })
      
      if (res.ok) {
        setJewelryPageSuccess("Jewelry page details updated successfully!")
        setTimeout(() => setJewelryPageSuccess(""), 3000)
      } else {
        const err = await res.json()
        const msg = err.fix
          ? `${err.error}\n\nSQL Fix:\n${err.fix}`
          : err.error || "Failed to update details"
        setJewelryPageError(msg)
      }
    } catch (e) {
      setJewelryPageError("Network error. Please try again.")
    }
  }

  const handleSaveNavigationMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    setNavigationMenuError("")
    setNavigationMenuSuccess("")
    
    try {
      const res = await fetch("/api/navigation-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(navigationMenu)
      })
      
      if (res.ok) {
        setNavigationMenuSuccess("Navigation menu items updated successfully!")
        setTimeout(() => setNavigationMenuSuccess(""), 3000)
      } else {
        const err = await res.json()
        const msg = err.fix
          ? `${err.error}\n\nSQL Fix:\n${err.fix}`
          : err.error || "Failed to update menu items"
        setNavigationMenuError(msg)
      }
    } catch (e) {
      setNavigationMenuError("Network error. Please try again.")
    }
  }

  const handleSaveHomePage = async (e: React.FormEvent) => {
    e.preventDefault()
    setHomePageError("")
    setHomePageSuccess("")
    
    try {
      const res = await fetch("/api/home-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homePage)
      })
      
      if (res.ok) {
        setHomePageSuccess("Home page settings updated successfully!")
        setTimeout(() => setHomePageSuccess(""), 3000)
      } else {
        const err = await res.json()
        const msg = err.fix
          ? `${err.error}\n\nSQL Fix:\n${err.fix}`
          : err.error || "Failed to update home settings"
        setHomePageError(msg)
      }
    } catch (e) {
      setHomePageError("Network error. Please try again.")
    }
  }

  // Filtered products list
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#1C1C1C] font-sans antialiased">
      {/* ===== HEADER ===== */}
      <header className="border-b border-[#EAEAEA] bg-white px-6 py-4 md:px-12 shadow-xs">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-[#9A7B4F] transition-colors">
              <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <h1 className="font-serif text-lg md:text-xl font-semibold tracking-wider text-[#1C1C1C]">
              NEXT GENERATION GOLD <span className="font-sans text-[10px] text-muted-foreground ml-3 font-semibold border-l border-[#EAEAEA] pl-3 uppercase tracking-widest">Portal</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-[#FAF6F0] border border-[#EBE3D5] px-3.5 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-[#9A7B4F] animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#9A7B4F]">Admin Panel</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row min-h-[calc(100vh-69px)]">
        {/* ===== SIDE NAVIGATION ===== */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#EAEAEA] bg-white p-6 flex flex-col gap-6">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            <button
              onClick={() => handleTabChange("overview")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "overview" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
              Overview
            </button>
            <button
              onClick={() => handleTabChange("products")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "products" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <Package className="h-4 w-4" strokeWidth={1.5} />
              Products
            </button>
            <button
              onClick={() => handleTabChange("categories_tags")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "categories_tags" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <Tags className="h-4 w-4" strokeWidth={1.5} />
              Categories & Tags
            </button>
            <button
              onClick={() => handleTabChange("contacts")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "contacts" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} />
              Inquiries
              {contacts.length > 0 && (
                <span className="ml-auto bg-[#9A7B4F] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {contacts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("about_us")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "about_us" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <Info className="h-4 w-4" strokeWidth={1.5} />
              About Us Settings
            </button>
            <button
              onClick={() => handleTabChange("high_jewelry")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "high_jewelry" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <Star className="h-4 w-4" strokeWidth={1.5} />
              High Jewelry Settings
            </button>
            <button
              onClick={() => handleTabChange("jewelry_page")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "jewelry_page" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <Package className="h-4 w-4" strokeWidth={1.5} />
              Jewelry Page Subcats
            </button>
            <button
              onClick={() => handleTabChange("navigation_menu")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "navigation_menu" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
              Navigation Menu
            </button>
            <button
              onClick={() => handleTabChange("home_page")}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "home_page" 
                  ? "bg-[#FAF6F0] text-[#9A7B4F] border-l-2 border-[#9A7B4F]" 
                  : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
              }`}
            >
              <Home className="h-4 w-4" strokeWidth={1.5} />
              Home Page Settings
            </button>
          </nav>
        </aside>

        {/* ===== CONTENT AREA ===== */}
        <section className="flex-1 p-6 md:p-12 overflow-y-auto">
          {loading ? (
            <div className="flex h-[400px] flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-[#9A7B4F] border-r-2 border-r-transparent" />
              <p className="mt-4 text-xs tracking-widest text-muted-foreground uppercase font-semibold">Syncing luxury registry...</p>
            </div>
          ) : (
            <>
              {/* ========== OVERVIEW TAB ========== */}
              {activeTab === "overview" && (
                <div className="flex flex-col gap-10">
                  <div>
                    <h2 className="font-serif text-3xl text-[#1C1C1C] tracking-wide">Portal Overview</h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Status dashboard for Next Generation Gold registry.</p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-[#EAEAEA] bg-white p-6 rounded shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">Product Registry</p>
                        <h3 className="font-serif text-4xl text-[#1C1C1C] mt-2 font-semibold">{products.length}</h3>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Active SKUs cataloged</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[#FAF6F0] text-[#9A7B4F] flex items-center justify-center flex-none">
                        <Package className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="border border-[#EAEAEA] bg-white p-6 rounded shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">Categories & Tags</p>
                        <h3 className="font-serif text-4xl text-[#1C1C1C] mt-2 font-semibold">{categories.length + tags.length}</h3>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">{categories.length} categories, {tags.length} tags</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[#FAF6F0] text-[#9A7B4F] flex items-center justify-center flex-none">
                        <Tags className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="border border-[#EAEAEA] bg-white p-6 rounded shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">Client Inquiries</p>
                        <h3 className="font-serif text-4xl text-[#1C1C1C] mt-2 font-semibold">{contacts.length}</h3>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Forms submitted by clients</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[#FAF6F0] text-[#9A7B4F] flex items-center justify-center flex-none">
                        <Mail className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Recent Messages Preview */}
                  <div className="border border-[#EAEAEA] bg-white p-6 rounded shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-serif text-lg text-[#1C1C1C] tracking-wide font-semibold">Recent Inquiries</h4>
                      <button onClick={() => handleTabChange("contacts")} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-[#9A7B4F] transition-colors">
                        View All
                      </button>
                    </div>

                    {contacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6 font-medium">No client messages received yet.</p>
                    ) : (
                      <div className="divide-y divide-[#EAEAEA]">
                        {contacts.slice(0, 3).map((submission) => (
                          <div key={submission.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#1C1C1C]">{submission.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate max-w-lg font-medium">{submission.message}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium">
                              {submission.productInterest && (
                                <span className="bg-[#FAF6F0] text-[#9A7B4F] border border-[#EBE3D5] px-2 py-0.5 rounded text-[10px] font-semibold">
                                  {submission.productInterest}
                                </span>
                              )}
                              <span className="text-muted-foreground font-semibold">
                                {new Date(submission.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========== PRODUCTS TAB ========== */}
              {activeTab === "products" && (
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-3xl text-[#1C1C1C] tracking-wide">Products Inventory</h2>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">Manage luxury products available on site.</p>
                    </div>
                    <Link
                      href="/admin/products/add"
                      className="flex items-center justify-center gap-2 bg-[#9A7B4F] hover:bg-[#856941] text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 rounded shadow-xs"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2} />
                      Add Product
                    </Link>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <input
                      type="text"
                      placeholder="Search products by name, collection or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#EAEAEA] pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#9A7B4F] transition-colors rounded shadow-xs text-[#1C1C1C]"
                    />
                  </div>

                  {/* Products Table */}
                  <div className="border border-[#EAEAEA] bg-white rounded overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-[#EAEAEA] bg-[#F9F9F9] text-xs uppercase tracking-widest font-bold text-muted-foreground">
                            <th className="p-4 font-bold">Product</th>
                            <th className="p-4 font-bold">SKU</th>
                            <th className="p-4 font-bold">Collection</th>
                            <th className="p-4 font-bold">Category</th>
                            <th className="p-4 font-bold">Price</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAEAEA]">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">No products found matching your search.</td>
                            </tr>
                          ) : (
                            filteredProducts.map((p) => (
                              <tr key={p.slug} className="hover:bg-[#FAF9F6] transition-colors text-[#1C1C1C]">
                                <td className="p-4 flex items-center gap-3">
                                  <div className="h-11 w-11 bg-[#F9F9F9] border border-[#EAEAEA] p-1 flex items-center justify-center rounded">
                                    <img src={p.image} alt="" className="h-full object-contain" />
                                  </div>
                                  <div>
                                    <p className="font-serif text-sm font-semibold text-[#1C1C1C] flex items-center gap-1.5">
                                      {p.name}
                                      {p.featured !== false && (
                                        <Star className="h-3.5 w-3.5 text-[#9A7B4F] fill-[#9A7B4F] flex-none" title="Featured on Homepage" />
                                      )}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">{p.material}</p>
                                  </div>
                                </td>
                                <td className="p-4 font-mono text-xs font-semibold text-muted-foreground">{p.sku}</td>
                                <td className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.collection}</td>
                                <td className="p-4 text-xs font-semibold text-muted-foreground">{p.category || "—"}</td>
                                <td className="p-4 font-serif text-sm font-bold text-[#9A7B4F]">{p.price}</td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <Link
                                      href={`/admin/products/edit/${p.slug}`}
                                      className="p-2 text-muted-foreground hover:text-[#9A7B4F] hover:bg-[#FAF6F0] rounded transition-all"
                                      title="Edit Product"
                                    >
                                      <Edit className="h-4 w-4" strokeWidth={1.5} />
                                    </Link>
                                    <button
                                      onClick={() => setDeletingProductSlug(p.slug)}
                                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== CATEGORIES & TAGS MANAGER ========== */}
              {activeTab === "categories_tags" && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="font-serif text-3xl text-[#1C1C1C] tracking-wide">Categories & Tags Manager</h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Create and delete global categories and tags dynamically selectable inside forms.</p>
                  </div>

                  {catTagError && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2 rounded font-medium shadow-xs">
                      <AlertTriangle className="h-4 w-4 flex-none" />
                      {catTagError}
                    </div>
                  )}

                  {catTagSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center gap-2 rounded font-medium shadow-xs">
                      <CheckCircle className="h-4 w-4 flex-none" />
                      {catTagSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                    {/* CATEGORY MANAGER CARD */}
                    <div className="border border-[#EAEAEA] bg-white p-6 rounded shadow-xs flex flex-col gap-6">
                      <div>
                        <h3 className="font-serif text-lg text-[#1C1C1C] font-semibold">Product Categories</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Filter collections on listing pages</p>
                      </div>

                      {/* Add Form */}
                      <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add new category (e.g. Rings)..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="flex-1 bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                        />
                        <button
                          type="submit"
                          className="bg-[#9A7B4F] hover:bg-[#856941] text-white px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors rounded shadow-xs flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add
                        </button>
                      </form>

                      {/* Categories List */}
                      <div className="border border-[#EAEAEA] rounded divide-y divide-[#EAEAEA] max-h-[400px] overflow-y-auto">
                        {categories.length === 0 ? (
                          <p className="text-xs text-muted-foreground p-4 text-center font-medium">No categories registered.</p>
                        ) : (
                          categories.map(cat => (
                            <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors">
                              <div>
                                <p className="text-xs font-semibold text-[#1C1C1C]">{cat.name}</p>
                                <p className="text-[9px] font-mono text-muted-foreground mt-0.5">slug: {cat.slug}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                title="Delete Category"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* TAGS MANAGER CARD */}
                    <div className="border border-[#EAEAEA] bg-white p-6 rounded shadow-xs flex flex-col gap-6">
                      <div>
                        <h3 className="font-serif text-lg text-[#1C1C1C] font-semibold">Product Tags</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">SEO and metal quality metadata</p>
                      </div>

                      {/* Add Form */}
                      <form onSubmit={handleAddTag} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add new tag (e.g. Platinum)..."
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          className="flex-1 bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                        />
                        <button
                          type="submit"
                          className="bg-[#9A7B4F] hover:bg-[#856941] text-white px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors rounded shadow-xs flex items-center gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add
                        </button>
                      </form>

                      {/* Tags Cloud / List */}
                      <div className="border border-[#EAEAEA] bg-[#FAF9F6] p-4 rounded min-h-[150px] max-h-[400px] overflow-y-auto">
                        {tags.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center p-6 font-medium">No tags registered.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {tags.map(t => (
                              <span 
                                key={t.id} 
                                className="inline-flex items-center gap-1.5 bg-white border border-[#EAEAEA] pl-3 pr-1 py-1 rounded-full text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shadow-xs hover:border-[#9A7B4F] transition-colors"
                              >
                                {t.name}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTag(t.id)}
                                  className="h-4.5 w-4.5 rounded-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all"
                                  title="Delete Tag"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== CONTACT INBOX TAB ========== */}
              {activeTab === "contacts" && (() => {
                const totalLeads = contacts.filter(c => c.type === "lead").length
                const totalGeneral = contacts.filter(c => c.type !== "lead").length
                
                const interestCounts: Record<string, number> = {}
                contacts.forEach(c => {
                  if (c.productInterest) {
                    interestCounts[c.productInterest] = (interestCounts[c.productInterest] || 0) + 1
                  }
                })
                const mostPopularInterest = Object.entries(interestCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"

                const filteredList = contacts.filter(c => {
                  if (inquiryTypeFilter === "contact") return c.type !== "lead"
                  if (inquiryTypeFilter === "lead") return c.type === "lead"
                  return true
                })

                return (
                  <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-3xl text-[#1C1C1C] tracking-wide">Inquiries & Leads Inbox</h2>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Manage consultant request leads from NGG Buddy and standard contact form inquiries.</p>
                      </div>
                      {totalLeads > 0 && (
                        <button
                          onClick={exportLeadsToCSV}
                          className="border border-[#9A7B4F] text-[#9A7B4F] hover:bg-[#FAF6F0] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all rounded shadow-xs"
                        >
                          Export Leads CSV
                        </button>
                      )}
                    </div>

                    {/* Analytics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="border border-[#FAF6F0] bg-[#FAF9F6] p-5 rounded flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">General Inquiries</p>
                          <h4 className="font-serif text-2xl text-[#1C1C1C] font-semibold mt-1">{totalGeneral}</h4>
                        </div>
                        <span className="text-[10px] bg-white border border-[#EAEAEA] text-muted-foreground px-2.5 py-1 rounded font-semibold uppercase">Standard</span>
                      </div>
                      
                      <div className="border border-[#FAF6F0] bg-[#FAF9F6] p-5 rounded flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-[#9A7B4F] font-bold">Chatbot Leads</p>
                          <h4 className="font-serif text-2xl text-[#9A7B4F] font-semibold mt-1">{totalLeads}</h4>
                        </div>
                        <span className="text-[10px] bg-[#9A7B4F] text-white px-2.5 py-1 rounded font-semibold uppercase">NGG Buddy</span>
                      </div>

                      <div className="border border-[#FAF6F0] bg-[#FAF9F6] p-5 rounded flex items-center justify-between shadow-2xs">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Popular Product Interest</p>
                          <h4 className="font-serif text-sm text-[#1C1C1C] font-bold mt-2.5 truncate max-w-[200px]">{mostPopularInterest}</h4>
                        </div>
                        <span className="text-[10px] bg-white border border-[#EAEAEA] text-muted-foreground px-2.5 py-1 rounded font-semibold uppercase">Enquiry Focus</span>
                      </div>
                    </div>

                    {/* Filter controls */}
                    <div className="flex gap-2 border-b border-[#EAEAEA] pb-4">
                      <button
                        onClick={() => setInquiryTypeFilter("all")}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded ${
                          inquiryTypeFilter === "all"
                            ? "bg-[#9A7B4F] text-white"
                            : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
                        }`}
                      >
                        All ({contacts.length})
                      </button>
                      <button
                        onClick={() => setInquiryTypeFilter("contact")}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded ${
                          inquiryTypeFilter === "contact"
                            ? "bg-[#9A7B4F] text-white"
                            : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
                        }`}
                      >
                        Inquiries ({totalGeneral})
                      </button>
                      <button
                        onClick={() => setInquiryTypeFilter("lead")}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded ${
                          inquiryTypeFilter === "lead"
                            ? "bg-[#9A7B4F] text-white"
                            : "text-muted-foreground hover:bg-[#F9F9F9] hover:text-[#1C1C1C]"
                        }`}
                      >
                        Buddy Leads ({totalLeads})
                      </button>
                    </div>

                    {filteredList.length === 0 ? (
                      <div className="border border-[#EAEAEA] bg-white p-12 text-center rounded shadow-xs">
                        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground font-medium">No inbox messages match the active filters.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredList.map((c) => (
                          <div 
                            key={c.id} 
                            onClick={() => setSelectedContact(c)}
                            className="border border-[#EAEAEA] bg-white p-6 rounded hover:border-[#9A7B4F] transition-all cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-4 text-[10px] font-semibold text-muted-foreground">
                                <span className="font-mono bg-[#F9F9F9] px-2 py-0.5 rounded border border-[#EAEAEA]">#{c.id}</span>
                                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h4 className="text-sm font-semibold text-[#1C1C1C] group-hover:text-[#9A7B4F] transition-colors">{c.name}</h4>
                                {c.type === "lead" ? (
                                  <span className="text-[8px] uppercase tracking-widest font-extrabold bg-[#FAF6F0] border border-[#EBE3D5] text-[#9A7B4F] px-2 py-0.5 rounded flex-none">Buddy Lead</span>
                                ) : (
                                  <span className="text-[8px] uppercase tracking-widest font-extrabold bg-gray-50 border border-gray-150 text-gray-400 px-2 py-0.5 rounded flex-none">Inquiry</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate font-medium">{c.email}</p>
                              
                              {c.phone && (
                                <p className="text-[11px] text-muted-foreground mt-2 font-mono font-medium">Phone: <span className="text-[#1C1C1C] font-semibold">{c.phone}</span></p>
                              )}
                              {c.city && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">City: <span className="text-[#1C1C1C] font-semibold">{c.city}</span></p>
                              )}

                              <p className="text-xs font-bold text-[#1C1C1C] mt-4 uppercase tracking-wider border-l-2 border-[#9A7B4F] pl-2 truncate">{c.subject}</p>
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed font-medium">{c.message}</p>
                            </div>
                            
                            {c.productInterest && (
                              <div className="mt-5 pt-3 border-t border-[#F5F5F5] flex items-center justify-between text-[10px] font-semibold">
                                <span className="uppercase tracking-widest text-muted-foreground">Interest:</span>
                                <span className="font-serif text-[#9A7B4F] truncate max-w-[150px] font-bold">{c.productInterest}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ========== ABOUT US SETTINGS TAB ========== */}
              {activeTab === "about_us" && aboutUs && (
                <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                  <div>
                    <h2 className="font-serif text-3xl text-[#1C1C1C] tracking-wide">About Us Settings</h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Update the story, company profile details, vision, and mission content displayed on your public website.</p>
                  </div>

                  {aboutUsSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded font-semibold">
                      {aboutUsSuccess}
                    </div>
                  )}
                  {aboutUsError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded font-semibold whitespace-pre-wrap font-mono leading-relaxed">
                      {aboutUsError}
                    </div>
                  )}

                  <form onSubmit={handleSaveAboutUs} className="flex flex-col gap-8 bg-white border border-[#EAEAEA] p-8 rounded shadow-xs">
                    
                    {/* Beginning Story Section */}
                    <div className="flex flex-col gap-5">
                      
                      {/* Beginning Section Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Beginning Title</label>
                          <input
                            type="text"
                            value={aboutUs.beginningTitle || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, beginningTitle: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <ImageUploader
                          label="Beginning Section Image"
                          value={aboutUs.beginningImage || ""}
                          onSelect={(url) => setAboutUs({ ...aboutUs, beginningImage: url })}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Beginning Descriptive Text</label>
                        <textarea
                          rows={4}
                          value={aboutUs.beginningText || ""}
                          onChange={(e) => setAboutUs({ ...aboutUs, beginningText: e.target.value })}
                          className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] leading-relaxed resize-y"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-5 mt-4">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold border-b border-[#FAF6F0] pb-2">2. Vision Statement</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Vision Title</label>
                          <input
                            type="text"
                            value={aboutUs.visionTitle || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, visionTitle: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <ImageUploader
                          label="Vision Section Image"
                          value={aboutUs.visionImage || ""}
                          onSelect={(url) => setAboutUs({ ...aboutUs, visionImage: url })}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Vision Statement Text</label>
                        <textarea
                          rows={4}
                          value={aboutUs.visionText || ""}
                          onChange={(e) => setAboutUs({ ...aboutUs, visionText: e.target.value })}
                          className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] leading-relaxed resize-y"
                          required
                        />
                      </div>
                    </div>

                    {/* Mission Section */}
                    <div className="flex flex-col gap-5 mt-4">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold border-b border-[#FAF6F0] pb-2">3. Mission Philosophy</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Mission Title</label>
                          <input
                            type="text"
                            value={aboutUs.missionTitle || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, missionTitle: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <ImageUploader
                          label="Mission Section Image"
                          value={aboutUs.missionImage || ""}
                          onSelect={(url) => setAboutUs({ ...aboutUs, missionImage: url })}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Mission Descriptive Text</label>
                        <textarea
                          rows={4}
                          value={aboutUs.missionText || ""}
                          onChange={(e) => setAboutUs({ ...aboutUs, missionText: e.target.value })}
                          className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] leading-relaxed resize-y"
                          required
                        />
                      </div>
                    </div>

                    {/* Company Profile Details */}
                    <div className="flex flex-col gap-5 mt-4">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold border-b border-[#FAF6F0] pb-2">4. Corporate Directory Info</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Company Name</label>
                          <input
                            type="text"
                            value={aboutUs.companyName || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, companyName: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Corporate Email</label>
                          <input
                            type="email"
                            value={aboutUs.companyEmail || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, companyEmail: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Helpline / Phone</label>
                          <input
                            type="text"
                            value={aboutUs.companyPhone || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, companyPhone: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Website URL</label>
                          <input
                            type="text"
                            value={aboutUs.companyWebsite || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, companyWebsite: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Establishment / Setup Date</label>
                          <input
                            type="text"
                            value={aboutUs.setupDate || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, setupDate: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Registered Capital</label>
                          <input
                            type="text"
                            value={aboutUs.capital || ""}
                            onChange={(e) => setAboutUs({ ...aboutUs, capital: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Business Content & Description</label>
                        <textarea
                          rows={3}
                          value={aboutUs.businessContent || ""}
                          onChange={(e) => setAboutUs({ ...aboutUs, businessContent: e.target.value })}
                          className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] leading-relaxed resize-y"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#9A7B4F] hover:bg-[#856941] text-white py-4 text-xs font-semibold uppercase tracking-widest mt-4 transition-colors duration-300 rounded shadow-xs"
                    >
                      Save About Us Details
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "high_jewelry" && highJewelry && (
                <div className="flex flex-col gap-6 max-w-4xl">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-[#9A7B4F] uppercase tracking-widest">Settings Panel</span>
                    <h2 className="font-serif text-2xl md:text-3xl text-[#1C1C1C] font-semibold tracking-wide">High Jewelry Page Settings</h2>
                    <p className="text-xs text-muted-foreground font-medium">Update the banner image, headers, text description overlays, and page intro copy of your luxury High Jewelry section.</p>
                  </div>

                  {highJewelrySuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded font-semibold">
                      {highJewelrySuccess}
                    </div>
                  )}
                  {highJewelryError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded font-semibold whitespace-pre-wrap font-mono leading-relaxed">
                      {highJewelryError}
                    </div>
                  )}

                  <form onSubmit={handleSaveHighJewelry} className="flex flex-col gap-8 bg-white border border-[#EAEAEA] p-8 rounded shadow-xs">
                    
                    {/* Header Intro Section */}
                    <div className="flex flex-col gap-5">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold border-b border-[#FAF6F0] pb-2">1. Page Intro Copy</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Intro Title</label>
                          <input
                            type="text"
                            value={highJewelry.title || ""}
                            onChange={(e) => setHighJewelry({ ...highJewelry, title: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Intro Paragraph Description</label>
                        <textarea
                          rows={4}
                          value={highJewelry.description || ""}
                          onChange={(e) => setHighJewelry({ ...highJewelry, description: e.target.value })}
                          className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] leading-relaxed resize-y"
                          required
                        />
                      </div>
                    </div>

                    {/* Banner Section */}
                    <div className="flex flex-col gap-5 mt-4">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold border-b border-[#FAF6F0] pb-2">2. Hero Banner & Overlays</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Banner Main Title Overlay</label>
                          <input
                            type="text"
                            value={highJewelry.bannerTitle || ""}
                            onChange={(e) => setHighJewelry({ ...highJewelry, bannerTitle: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Banner Subtitle Overlay</label>
                          <input
                            type="text"
                            value={highJewelry.bannerSubtitle || ""}
                            onChange={(e) => setHighJewelry({ ...highJewelry, bannerSubtitle: e.target.value })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                      </div>

                      <ImageUploader
                        label="Hero Banner Image"
                        value={highJewelry.bannerImage || ""}
                        onSelect={(url) => setHighJewelry({ ...highJewelry, bannerImage: url })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-[#9A7B4F] hover:bg-[#856941] text-white py-4 text-xs font-semibold uppercase tracking-widest mt-4 transition-colors duration-300 rounded shadow-xs"
                    >
                      Save High Jewelry Details
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "jewelry_page" && jewelryPage && (
                <div className="flex flex-col gap-6 max-w-4xl">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-[#9A7B4F] uppercase tracking-widest">Settings Panel</span>
                    <h2 className="font-serif text-2xl md:text-3xl text-[#1C1C1C] font-semibold tracking-wide">Jewelry Category Page Settings</h2>
                    <p className="text-xs text-muted-foreground font-medium">Configure the 4 main sub-category grid cards shown at the top of the Jewelry category page.</p>
                  </div>

                  {jewelryPageSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded font-semibold">
                      {jewelryPageSuccess}
                    </div>
                  )}
                  {jewelryPageError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded font-semibold whitespace-pre-wrap font-mono leading-relaxed">
                      {jewelryPageError}
                    </div>
                  )}

                  <form onSubmit={handleSaveJewelryPage} className="flex flex-col gap-8 bg-white border border-[#EAEAEA] p-8 rounded shadow-xs">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {(jewelryPage.cards || []).map((card: any, idx: number) => (
                        <div key={card.id} className="border border-[#FAF6F0] bg-[#FAF9F6] p-6 rounded flex flex-col gap-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">Card #{idx + 1}</h3>
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Display Title (e.g. NECKLACES)</label>
                            <input
                              type="text"
                              value={card.title || ""}
                              onChange={(e) => {
                                const newCards = [...jewelryPage.cards]
                                newCards[idx] = { ...card, title: e.target.value }
                                setJewelryPage({ ...jewelryPage, cards: newCards })
                              }}
                              className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Target Category Filter String (e.g. necklaces)</label>
                            <input
                              type="text"
                              value={card.targetCategory || ""}
                              onChange={(e) => {
                                const newCards = [...jewelryPage.cards]
                                newCards[idx] = { ...card, targetCategory: e.target.value }
                                setJewelryPage({ ...jewelryPage, cards: newCards })
                              }}
                              className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                              required
                            />
                          </div>

                          <ImageUploader
                            label="Card Image"
                            value={card.image || ""}
                            onSelect={(url) => {
                              const newCards = [...jewelryPage.cards]
                              newCards[idx] = { ...card, image: url }
                              setJewelryPage({ ...jewelryPage, cards: newCards })
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="bg-[#9A7B4F] hover:bg-[#856941] text-white py-4 text-xs font-semibold uppercase tracking-widest mt-4 transition-colors duration-300 rounded shadow-xs"
                    >
                      Save Jewelry Page Settings
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "navigation_menu" && navigationMenu && (
                <div className="flex flex-col gap-6 max-w-4xl">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#9A7B4F] uppercase tracking-widest">Settings Panel</span>
                      <h2 className="font-serif text-2xl md:text-3xl text-[#1C1C1C] font-semibold tracking-wide">Header Navigation Menu Settings</h2>
                      <p className="text-xs text-muted-foreground font-medium">Add, delete, rename, or update the links inside the main header navigation menu of Next Generation Gold.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextId = navigationMenu.length > 0 ? Math.max(...navigationMenu.map(m => m.id)) + 1 : 1
                        setNavigationMenu([...navigationMenu, { id: nextId, name: "NEW ITEM", href: "/category/new" }])
                      }}
                      className="flex items-center gap-2 bg-[#9A7B4F] hover:bg-[#856941] text-white px-4 py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Item
                    </button>
                  </div>

                  {navigationMenuSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded font-semibold">
                      {navigationMenuSuccess}
                    </div>
                  )}
                  {navigationMenuError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded font-semibold whitespace-pre-wrap font-mono leading-relaxed">
                      {navigationMenuError}
                    </div>
                  )}

                  <form onSubmit={handleSaveNavigationMenu} className="flex flex-col gap-6 bg-white border border-[#EAEAEA] p-8 rounded shadow-xs">
                    
                    {navigationMenu.length === 0 ? (
                      <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                        No menu items. Click "Add Item" above to create one.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {navigationMenu.map((item, idx) => (
                          <div key={item.id} className="flex items-end gap-4 p-4 border border-[#F5F5F5] rounded bg-[#FAF9F6]">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Item Name (e.g. WATCHES)</label>
                                <input
                                  type="text"
                                  value={item.name || ""}
                                  onChange={(e) => {
                                    const nextMenu = [...navigationMenu]
                                    nextMenu[idx] = { ...item, name: e.target.value }
                                    setNavigationMenu(nextMenu)
                                  }}
                                  className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                                  required
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Target URL (e.g. /category/watches)</label>
                                <input
                                  type="text"
                                  value={item.href || ""}
                                  onChange={(e) => {
                                    const nextMenu = [...navigationMenu]
                                    nextMenu[idx] = { ...item, href: e.target.value }
                                    setNavigationMenu(nextMenu)
                                  }}
                                  className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                                  required
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const nextMenu = navigationMenu.filter(m => m.id !== item.id)
                                setNavigationMenu(nextMenu)
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 p-2.5 rounded transition-all shrink-0 mb-0.5"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="bg-[#9A7B4F] hover:bg-[#856941] text-white py-4 text-xs font-semibold uppercase tracking-widest mt-4 transition-colors duration-300 rounded shadow-xs"
                    >
                      Save Navigation Menu Items
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "home_page" && homePage && (
                <div className="flex flex-col gap-6 max-w-4xl">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-[#9A7B4F] uppercase tracking-widest">Settings Panel</span>
                    <h2 className="font-serif text-2xl md:text-3xl text-[#1C1C1C] font-semibold tracking-wide">Home Page Content Settings</h2>
                    <p className="text-xs text-muted-foreground font-medium">Customize the text overlays, images, button descriptions, and category cards displayed on your homepage.</p>
                  </div>

                  {homePageSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded font-semibold">
                      {homePageSuccess}
                    </div>
                  )}
                  {homePageError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded font-semibold whitespace-pre-wrap font-mono leading-relaxed">
                      {homePageError}
                    </div>
                  )}

                  <form onSubmit={handleSaveHomePage} className="flex flex-col gap-8 bg-white border border-[#EAEAEA] p-8 rounded shadow-xs">
                    
                    {/* SECTION 1: HERO */}
                    <div className="flex flex-col gap-5 border-b border-[#FAF6F0] pb-6">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold">1. Hero Banner Section</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Hero Title</label>
                          <input
                            type="text"
                            value={homePage.hero?.title || ""}
                            onChange={(e) => setHomePage({ ...homePage, hero: { ...homePage.hero, title: e.target.value } })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Button Link Destination</label>
                          <input
                            type="text"
                            value={homePage.hero?.buttonLink || ""}
                            onChange={(e) => setHomePage({ ...homePage, hero: { ...homePage.hero, buttonLink: e.target.value } })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Hero Description</label>
                          <textarea
                            rows={2}
                            value={homePage.hero?.description || ""}
                            onChange={(e) => setHomePage({ ...homePage, hero: { ...homePage.hero, description: e.target.value } })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] leading-relaxed resize-y"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Button Display Text</label>
                          <input
                            type="text"
                            value={homePage.hero?.buttonText || ""}
                            onChange={(e) => setHomePage({ ...homePage, hero: { ...homePage.hero, buttonText: e.target.value } })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                      </div>
                      <ImageUploader
                        label="Hero Background Image"
                        value={homePage.hero?.image || ""}
                        onSelect={(url) => setHomePage({ ...homePage, hero: { ...homePage.hero, image: url } })}
                      />
                    </div>

                    {/* SECTION 2: CATEGORY CARDS */}
                    <div className="flex flex-col gap-5 border-b border-[#FAF6F0] pb-6">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold">2. Shop By Category Cards (3 Cards)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(homePage.categories || []).map((cat: any, idx: number) => (
                          <div key={idx} className="border border-[#FAF6F0] bg-[#FAF9F6] p-5 rounded flex flex-col gap-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B4F]">Category #{idx + 1}</h4>
                            <div className="flex flex-col gap-2">
                              <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Display Title</label>
                              <input
                                type="text"
                                value={cat.title || ""}
                                onChange={(e) => {
                                  const nextCats = [...homePage.categories]
                                  nextCats[idx] = { ...cat, title: e.target.value }
                                  setHomePage({ ...homePage, categories: nextCats })
                                }}
                                className="bg-white border border-[#EAEAEA] px-4 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">URL Destination</label>
                              <input
                                type="text"
                                value={cat.href || ""}
                                onChange={(e) => {
                                  const nextCats = [...homePage.categories]
                                  nextCats[idx] = { ...cat, href: e.target.value }
                                  setHomePage({ ...homePage, categories: nextCats })
                                }}
                                className="bg-white border border-[#EAEAEA] px-4 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                                required
                              />
                            </div>
                            <ImageUploader
                              label="Card Image"
                              value={cat.image || ""}
                              onSelect={(url) => {
                                const nextCats = [...homePage.categories]
                                nextCats[idx] = { ...cat, image: url }
                                setHomePage({ ...homePage, categories: nextCats })
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 3: EDITORIALS */}
                    <div className="flex flex-col gap-6 border-b border-[#FAF6F0] pb-6">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold">3. Editorial Story Blocks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Editorial Block 1 */}
                        <div className="border border-[#FAF6F0] bg-[#FAF9F6] p-6 rounded flex flex-col gap-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B4F]">Editorial Block #1 (e.g. Timepieces)</h4>
                          <div className="flex flex-col gap-2">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Eyebrow Title</label>
                            <input
                              type="text"
                              value={homePage.editorial1?.eyebrow || ""}
                              onChange={(e) => setHomePage({ ...homePage, editorial1: { ...homePage.editorial1, eyebrow: e.target.value } })}
                              className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Heading Title</label>
                            <input
                              type="text"
                              value={homePage.editorial1?.title || ""}
                              onChange={(e) => setHomePage({ ...homePage, editorial1: { ...homePage.editorial1, title: e.target.value } })}
                              className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Description Copy</label>
                            <textarea
                              rows={3}
                              value={homePage.editorial1?.description || ""}
                              onChange={(e) => setHomePage({ ...homePage, editorial1: { ...homePage.editorial1, description: e.target.value } })}
                              className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] leading-relaxed resize-y"
                              required
                            />
                          </div>
                          <ImageUploader
                            label="Editorial Image"
                            value={homePage.editorial1?.image || ""}
                            onSelect={(url) => setHomePage({ ...homePage, editorial1: { ...homePage.editorial1, image: url } })}
                          />
                        </div>

                        {/* Editorial Block 2 */}
                        <div className="border border-[#FAF6F0] bg-[#FAF9F6] p-6 rounded flex flex-col gap-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B4F]">Editorial Block #2 (e.g. Love & Engagement)</h4>
                          <div className="flex flex-col gap-2">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Eyebrow Title</label>
                            <input
                              type="text"
                              value={homePage.editorial2?.eyebrow || ""}
                              onChange={(e) => setHomePage({ ...homePage, editorial2: { ...homePage.editorial2, eyebrow: e.target.value } })}
                              className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Heading Title</label>
                            <input
                              type="text"
                              value={homePage.editorial2?.title || ""}
                              onChange={(e) => setHomePage({ ...homePage, editorial2: { ...homePage.editorial2, title: e.target.value } })}
                              className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Description Copy</label>
                            <textarea
                              rows={3}
                              value={homePage.editorial2?.description || ""}
                              onChange={(e) => setHomePage({ ...homePage, editorial2: { ...homePage.editorial2, description: e.target.value } })}
                              className="bg-white border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] leading-relaxed resize-y"
                              required
                            />
                          </div>
                          <ImageUploader
                            label="Editorial Image"
                            value={homePage.editorial2?.image || ""}
                            onSelect={(url) => setHomePage({ ...homePage, editorial2: { ...homePage.editorial2, image: url } })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: WORLD OF NGG */}
                    <div className="flex flex-col gap-5 pb-4">
                      <h3 className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold">4. World of NGG Section</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Section Heading Title</label>
                          <input
                            type="text"
                            value={homePage.world?.title || ""}
                            onChange={(e) => setHomePage({ ...homePage, world: { ...homePage.world, title: e.target.value } })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Eyebrow Title</label>
                          <input
                            type="text"
                            value={homePage.world?.subtitle || ""}
                            onChange={(e) => setHomePage({ ...homePage, world: { ...homePage.world, subtitle: e.target.value } })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Button Display Text</label>
                          <input
                            type="text"
                            value={homePage.world?.buttonText || ""}
                            onChange={(e) => setHomePage({ ...homePage, world: { ...homePage.world, buttonText: e.target.value } })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Button URL Link</label>
                          <input
                            type="text"
                            value={homePage.world?.buttonLink || ""}
                            onChange={(e) => setHomePage({ ...homePage, world: { ...homePage.world, buttonLink: e.target.value } })}
                            className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                            required
                          />
                        </div>
                      </div>
                      <ImageUploader
                        label="Section Background Image"
                        value={homePage.world?.image || ""}
                        onSelect={(url) => setHomePage({ ...homePage, world: { ...homePage.world, image: url } })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-[#9A7B4F] hover:bg-[#856941] text-white py-4 text-xs font-semibold uppercase tracking-widest mt-4 transition-colors duration-300 rounded shadow-xs"
                    >
                      Save Home Page Settings
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ===== DELETE PRODUCT CONFIRM MODAL ===== */}
      {deletingProductSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeletingProductSlug(null)} />
          <div className="relative z-10 w-full max-w-md bg-white p-8 border border-[#EAEAEA] shadow-2xl rounded text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="font-serif text-2xl text-[#1C1C1C] mb-2 font-semibold">Delete Product</h3>
            <p className="text-sm text-muted-foreground mb-6 font-medium">Are you sure you want to remove this product from the registry? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeletingProductSlug(null)}
                className="flex-1 border border-[#EAEAEA] hover:bg-[#F9F9F9] py-3 text-xs font-semibold uppercase tracking-widest text-[#1C1C1C] transition-colors rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 text-xs font-semibold uppercase tracking-widest transition-colors rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTACT DETAILS VIEW MODAL ===== */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedContact(null)} />
          <div className="relative z-10 w-full max-w-xl bg-white p-8 border border-[#EAEAEA] shadow-2xl rounded">
            <button 
              onClick={() => setSelectedContact(null)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-[#9A7B4F] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#EAEAEA] pb-4">
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono bg-[#F9F9F9] px-2 py-0.5 rounded border border-[#EAEAEA]">Submission #{selectedContact.id}</span>
                  <h3 className="font-serif text-2xl text-[#1C1C1C] mt-2 font-semibold">Inquiry Details</h3>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-5 text-sm mt-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Client Name</span>
                  <p className="text-[#1C1C1C] font-semibold mt-1">{selectedContact.name}</p>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Email Address</span>
                  <p className="text-[#9A7B4F] font-semibold mt-1">
                    <a href={`mailto:${selectedContact.email}`} className="hover:underline">{selectedContact.email}</a>
                  </p>
                </div>

                {selectedContact.phone && (
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Phone Number</span>
                    <p className="text-[#1C1C1C] font-semibold mt-1 font-mono">{selectedContact.phone}</p>
                  </div>
                )}

                {selectedContact.city && (
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Delivery City</span>
                    <p className="text-[#1C1C1C] font-semibold mt-1">{selectedContact.city}</p>
                  </div>
                )}

                {selectedContact.productInterest && (
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Product Interest</span>
                    <p className="text-[#1C1C1C] mt-1 font-serif text-base font-semibold">{selectedContact.productInterest}</p>
                  </div>
                )}

                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Subject</span>
                  <p className="text-[#1C1C1C] font-semibold mt-1">{selectedContact.subject}</p>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Client Message</span>
                  <div className="bg-[#F9F9F9] border border-[#EAEAEA] p-4 rounded text-muted-foreground leading-relaxed mt-2 text-xs whitespace-pre-line font-medium">
                    {selectedContact.message}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedContact(null)}
                className="w-full bg-[#9A7B4F] hover:bg-[#856941] text-white py-4 text-xs font-semibold uppercase tracking-widest mt-8 transition-colors duration-300 rounded shadow-xs"
              >
                Close Message
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-[#9A7B4F] border-r-2 border-r-transparent" />
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  )
}
