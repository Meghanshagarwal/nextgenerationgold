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
  Inbox
} from "lucide-react"
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
  
  // Navigation tabs: 'overview' | 'products' | 'categories_tags' | 'contacts'
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories_tags" | "contacts">("overview")
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
    if (tabParam && ["overview", "products", "categories_tags", "contacts"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Fetch all database registry items
  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, conRes, catRes, tagRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/contacts"),
        fetch("/api/categories"),
        fetch("/api/tags")
      ])
      
      if (prodRes.ok) setProducts(await prodRes.json())
      if (conRes.ok) setContacts(await conRes.json())
      if (catRes.ok) setCategories(await catRes.json())
      if (tagRes.ok) setTags(await tagRes.json())
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

  const handleTabChange = (tab: "overview" | "products" | "categories_tags" | "contacts") => {
    setActiveTab(tab)
    router.replace(`/admin?tab=${tab}`)
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
