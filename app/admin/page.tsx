"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Package, 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  LayoutDashboard, 
  FileText, 
  ArrowLeft,
  X,
  CheckCircle,
  AlertTriangle,
  Star
} from "lucide-react"
import { Product } from "@/lib/products"
import { ContactSubmission } from "@/lib/db"

export default function AdminPage() {
  // Navigation tabs: 'overview' | 'products' | 'contacts'
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "contacts">("overview")
  const [products, setProducts] = useState<Product[]>([])
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductSlug, setDeletingProductSlug] = useState<string | null>(null)
  
  // Form State
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    collection: "",
    price: "",
    description: "",
    material: "",
    image: "",
    details: "",
    sku: "",
    featured: true
  })

  // Selected contact for detail view modal
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null)

  // Fetch all products and contacts
  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, conRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/contacts")
      ])
      if (prodRes.ok) {
        setProducts(await prodRes.json())
      }
      if (conRes.ok) {
        setContacts(await conRes.json())
      }
    } catch (e) {
      console.error("Failed to load admin data:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Open modal to add product
  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      collection: "Signature Collection",
      price: "₹",
      description: "",
      material: "",
      image: "/images/prod-bracelet-yellow.png", // prefilled premium asset
      details: "",
      sku: "",
      featured: true
    })
    setFormError("")
    setFormSuccess("")
    setProductModalOpen(true)
  }

  // Open modal to edit product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      collection: product.collection,
      price: product.price,
      description: product.description,
      material: product.material,
      image: product.image,
      details: product.details.join("\n"),
      sku: product.sku,
      featured: product.featured !== false
    })
    setFormError("")
    setFormSuccess("")
    setProductModalOpen(true)
  }

  // Submit Add / Edit Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError("")
    
    const url = editingProduct 
      ? `/api/products/${editingProduct.slug}`
      : "/api/products"
    
    const method = editingProduct ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormSuccess(editingProduct ? "Product updated successfully!" : "Product added successfully!")
        await loadData()
        setTimeout(() => {
          setProductModalOpen(false)
          setFormSuccess("")
        }, 1500)
      } else {
        const err = await res.json()
        setFormError(err.error || "An error occurred. Please check details.")
      }
    } catch (e) {
      setFormError("Failed to save product. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

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
              onClick={() => setActiveTab("overview")}
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
              onClick={() => setActiveTab("products")}
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
              onClick={() => setActiveTab("contacts")}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-[#EAEAEA] bg-white p-6 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">Product Registry</p>
                        <h3 className="font-serif text-4xl text-[#1C1C1C] mt-2 font-semibold">{products.length}</h3>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Active SKUs cataloged</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[#FAF6F0] text-[#9A7B4F] flex items-center justify-center">
                        <Package className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="border border-[#EAEAEA] bg-white p-6 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">Client Inquiries</p>
                        <h3 className="font-serif text-4xl text-[#1C1C1C] mt-2 font-semibold">{contacts.length}</h3>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Forms submitted by clients</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[#FAF6F0] text-[#9A7B4F] flex items-center justify-center">
                        <Mail className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Recent Messages Preview */}
                  <div className="border border-[#EAEAEA] bg-white p-6 rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-serif text-lg text-[#1C1C1C] tracking-wide font-semibold">Recent Inquiries</h4>
                      <button onClick={() => setActiveTab("contacts")} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-[#9A7B4F] transition-colors">
                        View All
                      </button>
                    </div>

                    {contacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No client messages received yet.</p>
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
                    <button
                      onClick={handleOpenAddModal}
                      className="flex items-center justify-center gap-2 bg-[#9A7B4F] hover:bg-[#856941] text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 rounded shadow-xs"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2} />
                      Add Product
                    </button>
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
                            <th className="p-4 font-bold">Price</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAEAEA]">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">No products found matching your search.</td>
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
                                <td className="p-4 font-serif text-sm font-bold text-[#9A7B4F]">{p.price}</td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <button
                                      onClick={() => handleOpenEditModal(p)}
                                      className="p-2 text-muted-foreground hover:text-[#9A7B4F] hover:bg-[#FAF6F0] rounded transition-all"
                                      title="Edit Product"
                                    >
                                      <Edit className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
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

              {/* ========== CONTACT INBOX TAB ========== */}
              {activeTab === "contacts" && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="font-serif text-3xl text-[#1C1C1C] tracking-wide">Inquiries Inbox</h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Read contact messages and consultant request forms submitted by clients.</p>
                  </div>

                  {contacts.length === 0 ? (
                    <div className="border border-[#EAEAEA] bg-white p-12 text-center rounded shadow-xs">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" strokeWidth={1.5} />
                      <p className="text-sm text-muted-foreground font-medium">No client messages have been received yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {contacts.map((c) => (
                        <div 
                          key={c.id} 
                          onClick={() => setSelectedContact(c)}
                          className="border border-[#EAEAEA] bg-white p-6 rounded hover:border-[#9A7B4F] transition-all cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4 text-xs font-semibold text-muted-foreground">
                              <span className="font-mono bg-[#F9F9F9] px-2 py-0.5 rounded border border-[#EAEAEA]">#{c.id}</span>
                              <span>
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-[#1C1C1C] group-hover:text-[#9A7B4F] transition-colors">{c.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate font-medium">{c.email}</p>
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
              )}
            </>
          )}
        </section>
      </div>

      {/* ===== EDIT/ADD PRODUCT MODAL ===== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setProductModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white p-8 border border-[#EAEAEA] shadow-2xl rounded max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setProductModalOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-[#9A7B4F] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-2xl text-[#1C1C1C] tracking-wide mb-6 font-semibold border-b border-[#F5F5F5] pb-4">
              {editingProduct ? "Edit Luxury Product" : "Register New Product"}
            </h3>

            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2 rounded font-medium">
                <AlertTriangle className="h-4 w-4 flex-none" />
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center gap-2 rounded font-medium">
                <CheckCircle className="h-4 w-4 flex-none" />
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. T1 Smile Pendant"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Collection Category</label>
                <select
                  value={formData.collection}
                  onChange={(e) => setFormData(prev => ({ ...prev, collection: e.target.value }))}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                >
                  <option value="Signature Collection">Signature Collection</option>
                  <option value="HardWear">HardWear</option>
                  <option value="Smile">Smile</option>
                  <option value="T1">T1</option>
                  <option value="Lock">Lock</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Price</label>
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. ₹4,200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Material</label>
                <input
                  type="text"
                  required
                  value={formData.material}
                  onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. 18k Rose Gold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="Image path e.g. /images/..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">SKU Number</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="Leave empty for auto-generated"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2 py-1">
                <label className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-[#1C1C1C] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4.5 w-4.5 border-[#EAEAEA] bg-[#F9F9F9] accent-[#9A7B4F] rounded focus:ring-0 cursor-pointer"
                  />
                  <span>Feature on Homepage Slider (Feature It)</span>
                </label>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Description Details</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] resize-none"
                  placeholder="Explain the item's luxury highlights..."
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Features (One item per line)</label>
                <textarea
                  rows={4}
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] resize-none"
                  placeholder="e.g.&#10;18k gold&#10;Adjustable chain 16-18 inches&#10;Lobster clasp closure"
                />
              </div>

              <div className="md:col-span-2 flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 border border-[#EAEAEA] hover:bg-[#F9F9F9] text-[#1C1C1C] py-4 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#9A7B4F] hover:bg-[#856941] text-white py-4 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 duration-300 rounded shadow-xs"
                >
                  {submitting ? "Saving SKU..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
