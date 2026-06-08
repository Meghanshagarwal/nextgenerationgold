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
  AlertTriangle
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
    sku: ""
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
      price: "$",
      description: "",
      material: "",
      image: "/images/prod-bracelet-yellow.png", // prefilled premium asset
      details: "",
      sku: ""
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
      sku: product.sku
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
    <main className="min-h-screen bg-[#0A0A0A] text-[#EAEAEA] font-sans antialiased">
      {/* ===== HEADER ===== */}
      <header className="border-b border-[#222222] bg-[#0E0E0E] px-6 py-4 md:px-12">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-[#C5A880] transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-serif text-xl font-semibold tracking-wide text-[#C5A880]">
              NEXT GENERATION GOLD <span className="font-sans text-xs text-muted-foreground ml-2 font-light border-l border-[#222] pl-2 uppercase">Portal</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Admin Mode</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row min-h-[calc(100vh-69px)]">
        {/* ===== SIDE NAVIGATION ===== */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#222222] bg-[#0C0C0C] p-6 flex flex-col gap-6">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "overview" 
                  ? "bg-[#1E1E1E] text-[#C5A880] border-l-2 border-[#C5A880]" 
                  : "text-muted-foreground hover:bg-[#121212] hover:text-[#EAEAEA]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "products" 
                  ? "bg-[#1E1E1E] text-[#C5A880] border-l-2 border-[#C5A880]" 
                  : "text-muted-foreground hover:bg-[#121212] hover:text-[#EAEAEA]"
              }`}
            >
              <Package className="h-4 w-4" />
              Products
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide uppercase transition-all duration-300 w-full rounded-md ${
                activeTab === "contacts" 
                  ? "bg-[#1E1E1E] text-[#C5A880] border-l-2 border-[#C5A880]" 
                  : "text-muted-foreground hover:bg-[#121212] hover:text-[#EAEAEA]"
              }`}
            >
              <Mail className="h-4 w-4" />
              Inquiries
              {contacts.length > 0 && (
                <span className="ml-auto bg-[#C5A880] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
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
              <div className="h-10 w-10 animate-spin rounded-full border-t border-[#C5A880]" />
              <p className="mt-4 text-xs tracking-widest text-muted-foreground uppercase">Syncing luxury registry...</p>
            </div>
          ) : (
            <>
              {/* ========== OVERVIEW TAB ========== */}
              {activeTab === "overview" && (
                <div className="flex flex-col gap-10">
                  <div>
                    <h2 className="font-serif text-3xl text-[#C5A880]">Portal Overview</h2>
                    <p className="text-xs text-muted-foreground mt-1">Status dashboard for Next Generation Gold registry.</p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-[#222] bg-[#0E0E0E] p-6 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs tracking-widest uppercase text-muted-foreground">Product Registry</p>
                        <h3 className="font-serif text-4xl text-foreground mt-2">{products.length}</h3>
                        <p className="text-[10px] text-muted-foreground mt-2">Active SKUs cataloged</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center">
                        <Package className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="border border-[#222] bg-[#0E0E0E] p-6 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs tracking-widest uppercase text-muted-foreground">Client Inquiries</p>
                        <h3 className="font-serif text-4xl text-foreground mt-2">{contacts.length}</h3>
                        <p className="text-[10px] text-muted-foreground mt-2">Forms submitted by clients</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center">
                        <Mail className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Messages Preview */}
                  <div className="border border-[#222] bg-[#0E0E0E] p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-serif text-lg text-[#C5A880]">Recent Inquiries</h4>
                      <button onClick={() => setActiveTab("contacts")} className="text-xs text-muted-foreground hover:text-[#C5A880] transition-colors">
                        View All
                      </button>
                    </div>

                    {contacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No client messages received yet.</p>
                    ) : (
                      <div className="divide-y divide-[#222]">
                        {contacts.slice(0, 3).map((submission) => (
                          <div key={submission.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{submission.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate max-w-lg">{submission.message}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              {submission.productInterest && (
                                <span className="bg-[#1E1E1E] text-[#C5A880] px-2 py-0.5 rounded text-[10px]">
                                  {submission.productInterest}
                                </span>
                              )}
                              <span className="text-muted-foreground">
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-3xl text-[#C5A880]">Products Inventory</h2>
                      <p className="text-xs text-muted-foreground mt-1">Manage luxury products available on site.</p>
                    </div>
                    <button
                      onClick={handleOpenAddModal}
                      className="flex items-center justify-center gap-2 bg-[#C5A880] hover:bg-[#B3966D] text-black px-5 py-3 text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      Add Product
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search products by name, collection or SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0E0E0E] border border-[#222] pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded"
                    />
                  </div>

                  {/* Products Table */}
                  <div className="border border-[#222] bg-[#0E0E0E] rounded overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-[#222] bg-[#121212] text-xs uppercase tracking-widest text-muted-foreground">
                            <th className="p-4 font-semibold">Product</th>
                            <th className="p-4 font-semibold">SKU</th>
                            <th className="p-4 font-semibold">Collection</th>
                            <th className="p-4 font-semibold">Price</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222]">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">No products found matching your search.</td>
                            </tr>
                          ) : (
                            filteredProducts.map((p) => (
                              <tr key={p.slug} className="hover:bg-[#121212] transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                  <div className="h-10 w-10 bg-[#161616] p-1 flex items-center justify-center">
                                    <img src={p.image} alt="" className="h-full object-contain" />
                                  </div>
                                  <div>
                                    <p className="font-serif text-sm text-foreground">{p.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.material}</p>
                                  </div>
                                </td>
                                <td className="p-4 font-mono text-xs">{p.sku}</td>
                                <td className="p-4 text-xs uppercase tracking-wider">{p.collection}</td>
                                <td className="p-4 font-semibold text-[#C5A880]">{p.price}</td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <button
                                      onClick={() => handleOpenEditModal(p)}
                                      className="p-2 text-muted-foreground hover:text-[#C5A880] transition-colors"
                                      title="Edit Product"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingProductSlug(p.slug)}
                                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                    <h2 className="font-serif text-3xl text-[#C5A880]">Inquiries Inbox</h2>
                    <p className="text-xs text-muted-foreground mt-1">Read contact messages and consultant request forms submitted by clients.</p>
                  </div>

                  {contacts.length === 0 ? (
                    <div className="border border-[#222] bg-[#0E0E0E] p-12 text-center rounded">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-sm text-muted-foreground">No client messages have been received yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {contacts.map((c) => (
                        <div 
                          key={c.id} 
                          onClick={() => setSelectedContact(c)}
                          className="border border-[#222] bg-[#0E0E0E] p-6 rounded hover:border-[#C5A880] transition-all cursor-pointer flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] text-muted-foreground font-mono">#{c.id}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-[#C5A880] transition-colors">{c.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.email}</p>
                            <p className="text-xs font-semibold text-foreground mt-3 uppercase tracking-wider text-[#C5A880]/95 truncate">{c.subject}</p>
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{c.message}</p>
                          </div>
                          
                          {c.productInterest && (
                            <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Interest:</span>
                              <span className="text-[10px] font-serif text-[#C5A880] font-semibold truncate max-w-[150px]">{c.productInterest}</span>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setProductModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-[#0E0E0E] p-8 border border-[#222] shadow-2xl rounded max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setProductModalOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-[#C5A880] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-2xl text-[#C5A880] mb-6">
              {editingProduct ? "Edit Luxury Product" : "Register New Product"}
            </h3>

            {formError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 rounded">
                <AlertTriangle className="h-4 w-4 flex-none" />
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 rounded">
                <CheckCircle className="h-4 w-4 flex-none" />
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#161616] border border-[#222] px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded text-foreground"
                  placeholder="e.g. T1 Smile Pendant"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Collection Category</label>
                <select
                  value={formData.collection}
                  onChange={(e) => setFormData(prev => ({ ...prev, collection: e.target.value }))}
                  className="w-full bg-[#161616] border border-[#222] px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded text-foreground"
                >
                  <option value="Signature Collection">Signature Collection</option>
                  <option value="HardWear">HardWear</option>
                  <option value="Smile">Smile</option>
                  <option value="T1">T1</option>
                  <option value="Lock">Lock</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Price</label>
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-[#161616] border border-[#222] px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded text-foreground"
                  placeholder="e.g. $4,200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Material</label>
                <input
                  type="text"
                  required
                  value={formData.material}
                  onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                  className="w-full bg-[#161616] border border-[#222] px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded text-foreground"
                  placeholder="e.g. 18k Rose Gold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full bg-[#161616] border border-[#222] px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded text-foreground"
                  placeholder="Image path e.g. /images/..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">SKU Number</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full bg-[#161616] border border-[#222] px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded text-foreground"
                  placeholder="Leave empty for auto-generated"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Description Details</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#161616] border border-[#222] px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded text-foreground resize-none"
                  placeholder="Explain the item's luxury highlights..."
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Features (One item per line)</label>
                <textarea
                  rows={4}
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  className="w-full bg-[#161616] border border-[#222] px-4 py-3 text-sm focus:outline-none focus:border-[#C5A880] transition-colors rounded text-foreground resize-none"
                  placeholder="e.g.&#10;18k gold&#10;Adjustable chain 16-18 inches&#10;Lobster clasp closure"
                />
              </div>

              <div className="md:col-span-2 flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 border border-[#222] hover:bg-[#161616] text-foreground py-4 text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#C5A880] hover:bg-[#B3966D] text-black py-4 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 duration-300"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingProductSlug(null)} />
          <div className="relative z-10 w-full max-w-md bg-[#0E0E0E] p-8 border border-[#222] shadow-2xl rounded text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-foreground mb-2">Delete Product</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to remove this product from the registry? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeletingProductSlug(null)}
                className="flex-1 border border-[#222] hover:bg-[#161616] py-3 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedContact(null)} />
          <div className="relative z-10 w-full max-w-xl bg-[#0E0E0E] p-8 border border-[#222] shadow-2xl rounded">
            <button 
              onClick={() => setSelectedContact(null)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-[#C5A880] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-4">
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">Submission #{selectedContact.id}</span>
                  <h3 className="font-serif text-2xl text-[#C5A880] mt-1">Inquiry Details</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-col gap-4 text-sm mt-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Client Name</span>
                  <p className="text-foreground font-medium mt-1">{selectedContact.name}</p>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email Address</span>
                  <p className="text-[#C5A880] mt-1">
                    <a href={`mailto:${selectedContact.email}`} className="hover:underline">{selectedContact.email}</a>
                  </p>
                </div>

                {selectedContact.productInterest && (
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Product Interest</span>
                    <p className="text-foreground mt-1 font-serif text-base">{selectedContact.productInterest}</p>
                  </div>
                )}

                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Subject</span>
                  <p className="text-foreground font-semibold mt-1">{selectedContact.subject}</p>
                </div>

                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Client Message</span>
                  <div className="bg-[#121212] border border-[#222] p-4 rounded text-muted-foreground leading-relaxed mt-2 text-xs whitespace-pre-line">
                    {selectedContact.message}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedContact(null)}
                className="w-full bg-[#C5A880] hover:bg-[#B3966D] text-black py-4 text-xs font-semibold uppercase tracking-widest mt-8 transition-colors duration-300"
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
