"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, AlertTriangle, Sparkles } from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"

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

export default function AddProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loadingConfig, setLoadingConfig] = useState(true)
  
  // Form State
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    collection: "Signature Collection",
    category: "",
    productType: "",
    shortDescription: "",
    description: "", // Full Description
    price: "₹",
    stockStatus: "In Stock",
    productionTime: "",
    styling: "",
    occasions: "",
    metalType: "",
    goldPurity: "",
    goldColor: "",
    grossWeight: "",
    netGoldWeight: "",
    diamondType: "",
    totalDiamondWeight: "",
    diamondShape: "",
    diamondColor: "",
    diamondClarity: "",
    numberOfDiamonds: "",
    gemstoneType: "",
    gemstoneShape: "",
    gemstoneSize: "",
    totalGemstoneWeight: "",
    numberOfGemstones: "",
    origin: "",
    treatment: "",
    dimensions: "",
    ringSize: "",
    necklaceLength: "",
    certification: "",
    hallmarkDetails: "",
    shippingInfo: "",
    seoTitle: "",
    seoDescription: "",
    image: "/images/prod-bracelet-yellow.png",
    images: [] as string[],
    details: "",
    featured: true,
    selectedTags: [] as string[],
    selectedCategories: [] as string[]
  })

  useEffect(() => {
    async function loadConfig() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags")
        ])
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData)
        }
        if (tagRes.ok) {
          setTags(await tagRes.json())
        }
      } catch (e) {
        console.error("Failed to load config details", e)
      } finally {
        setLoadingConfig(false)
      }
    }
    loadConfig()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => {
      const alreadySelected = prev.selectedTags.includes(tagName)
      return {
        ...prev,
        selectedTags: alreadySelected
          ? prev.selectedTags.filter(t => t !== tagName)
          : [...prev.selectedTags, tagName]
      }
    })
  }

  const handleCategoryToggle = (catName: string) => {
    setFormData(prev => {
      const alreadySelected = prev.selectedCategories.includes(catName)
      return {
        ...prev,
        selectedCategories: alreadySelected
          ? prev.selectedCategories.filter(c => c !== catName)
          : [...prev.selectedCategories, catName]
      }
    })
  }


  const generateSku = () => {
    const prefix = "NGG"
    const colCode = formData.collection.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "X")
    const rand = Math.floor(1000 + Math.random() * 9000)
    setFormData(prev => ({ ...prev, sku: `${prefix}-${colCode}-${rand}` }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError("")
    setFormSuccess("")

    if (!formData.name || !formData.collection || !formData.price) {
      setFormError("Product Name, Collection, and Price are required.")
      setSubmitting(false)
      return
    }

    const payload = {
      ...formData,
      category: formData.selectedCategories.join(", "),
      tags: formData.selectedTags
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setFormSuccess("Registry updated! Product registered successfully.")
        setTimeout(() => {
          router.push("/admin?tab=products")
        }, 1500)
      } else {
        const err = await res.json()
        setFormError(err.error || "An error occurred while registering the product.")
      }
    } catch (e) {
      setFormError("Network communication failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#1C1C1C] font-sans antialiased pb-20">
      {/* ===== HEADER ===== */}
      <header className="border-b border-[#EAEAEA] bg-white px-6 py-4 md:px-12 shadow-xs sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin?tab=products" className="text-muted-foreground hover:text-[#9A7B4F] transition-colors">
              <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="font-serif text-lg md:text-xl font-semibold tracking-wider text-[#1C1C1C]">
                REGISTER NEW PRODUCT
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">Admin Registry Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/admin?tab=products"
              className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-[#1C1C1C] border border-[#EAEAEA] px-4 py-2 bg-white transition-all rounded"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* ===== FORM CONTAINER ===== */}
      <div className="mx-auto max-w-[1400px] px-6 mt-10">
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs flex items-center gap-2 rounded font-medium max-w-4xl mx-auto shadow-xs">
            <AlertTriangle className="h-4 w-4 flex-none" />
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs flex items-center gap-2 rounded font-medium max-w-4xl mx-auto shadow-xs">
            <CheckCircle className="h-4 w-4 flex-none" />
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="bg-white border border-[#EAEAEA] p-6 md:p-8 rounded shadow-xs flex flex-col gap-6">
            <h3 className="font-serif text-lg text-[#1C1C1C] tracking-wide border-b border-[#F5F5F5] pb-3 font-semibold">
              1. Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. Classic Diamonds Pendant"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex justify-between items-center">
                  <span>SKU Number</span>
                  <button 
                    type="button" 
                    onClick={generateSku}
                    className="text-[10px] text-[#9A7B4F] hover:underline flex items-center gap-1 font-bold lowercase tracking-normal"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-generate
                  </button>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. NGG-SIG-PD-102"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Collection Name *</label>
                <select
                  name="collection"
                  value={formData.collection}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                >
                  <option value="Signature Collection">Signature Collection</option>
                  <option value="HardWear">HardWear</option>
                  <option value="Smile">Smile</option>
                  <option value="T1">T1</option>
                  <option value="Lock">Lock</option>
                  <option value="High Jewelry">High Jewelry</option>
                  <option value="Émeraude Lumière Ring Collection">Émeraude Lumière Ring Collection</option>
                  <option value="Aurora Opaline Collection">Aurora Opaline Collection</option>
                  <option value="Rosé Lumière Collection">Rosé Lumière Collection</option>
                  <option value="Aurelia Lumière Collection">Aurelia Lumière Collection</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Categories (Select Multiple) *</label>
                {loadingConfig ? (
                  <div className="h-11 w-full bg-[#F9F9F9] border border-[#EAEAEA] rounded animate-pulse" />
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 border border-[#EAEAEA] bg-[#FAF9F6] rounded">
                    {categories.length === 0 ? (
                      <span className="text-xs text-muted-foreground font-medium">No categories found.</span>
                    ) : (
                      categories.map(c => {
                        const isSelected = formData.selectedCategories.includes(c.name)
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleCategoryToggle(c.name)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                              isSelected 
                                ? "bg-[#9A7B4F] border-[#9A7B4F] text-white" 
                                : "bg-white border-[#EAEAEA] text-muted-foreground hover:border-[#9A7B4F] hover:text-[#9A7B4F]"
                            }`}
                          >
                            {c.name}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Product Type</label>
                <input
                  type="text"
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. Necklace, Bracelet, Ring"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Price *</label>
                <input
                  type="text"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. ₹9,500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Stock Status</label>
                <select
                  name="stockStatus"
                  value={formData.stockStatus}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Made by Order">Made by Order</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Production Time (IF MADE BY ORDER)</label>
                <input
                  type="text"
                  name="productionTime"
                  value={formData.productionTime}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. 2-3 weeks"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DESCRIPTIONS & MEDIA */}
          <div className="bg-white border border-[#EAEAEA] p-6 md:p-8 rounded shadow-xs flex flex-col gap-6">
            <h3 className="font-serif text-lg text-[#1C1C1C] tracking-wide border-b border-[#F5F5F5] pb-3 font-semibold">
              2. Descriptions & Media
            </h3>

            <div className="flex flex-col gap-5 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Short Description</label>
                <textarea
                  name="shortDescription"
                  rows={2}
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="Brief 1-2 sentence hook for catalog layouts..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Full Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="Detailed editorial story and highlight specifications..."
                />
              </div>

              <ImageUploader
                label="Product Image"
                value={formData.image}
                onSelect={(url) => setFormData(prev => ({ ...prev, image: url }))}
                required
              />

              {/* Product Gallery (Additional Images) */}
              <div className="flex flex-col gap-3 mt-4 border-t border-[#F5F5F5] pt-4">
                <label className="text-xs uppercase tracking-widest font-bold text-[#9A7B4F]">Product Gallery (Additional Images)</label>
                <p className="text-[10px] text-muted-foreground font-medium -mt-1">Upload additional images for the product detail carousel slider.</p>
                
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 border border-[#F5F5F5] bg-[#FAF9F6] p-4 rounded">
                    {formData.images.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative aspect-square border border-[#EAEAEA] bg-white rounded overflow-hidden group">
                        <img src={imgUrl} alt={`Gallery image ${imgIdx + 1}`} className="w-full h-full object-contain p-2" />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== imgIdx)
                            }))
                          }}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <ImageUploader
                  label="Select Gallery Images to Add"
                  value=""
                  multiple={true}
                  onSelect={(urls) => {
                    if (urls) {
                      const newUrls = Array.isArray(urls) ? urls : [urls]
                      setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), ...newUrls]
                      }))
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: MATERIAL & STYLING DETAILS */}
          <div className="bg-white border border-[#EAEAEA] p-6 md:p-8 rounded shadow-xs flex flex-col gap-6">
            <h3 className="font-serif text-lg text-[#1C1C1C] tracking-wide border-b border-[#F5F5F5] pb-3 font-semibold">
              3. Metal & Styling Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Styling Notes</label>
                <input
                  type="text"
                  name="styling"
                  value={formData.styling}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. Stackable with gold bands"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Occasions</label>
                <input
                  type="text"
                  name="occasions"
                  value={formData.occasions}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. Wedding, Gala, Everyday Luxury"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Metal Type</label>
                <input
                  type="text"
                  name="metalType"
                  value={formData.metalType}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. Gold, Platinum, Silver"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Gold Purity</label>
                <input
                  type="text"
                  name="goldPurity"
                  value={formData.goldPurity}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. 18k, 22k, 14k"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Gold Color</label>
                <input
                  type="text"
                  name="goldColor"
                  value={formData.goldColor}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. Rose Gold, Yellow Gold, White Gold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Material Display Value *</label>
                <input
                  type="text"
                  name="material"
                  required
                  value={formData.material}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. 18k Yellow Gold & Diamonds"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Gross Weight (g)</label>
                <input
                  type="text"
                  name="grossWeight"
                  value={formData.grossWeight}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. 12.45"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Net Gold Weight (g)</label>
                <input
                  type="text"
                  name="netGoldWeight"
                  value={formData.netGoldWeight}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. 10.82"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DIAMOND & GEMSTONE METRICS */}
          <div className="bg-white border border-[#EAEAEA] p-6 md:p-8 rounded shadow-xs flex flex-col gap-6">
            <h3 className="font-serif text-lg text-[#1C1C1C] tracking-wide border-b border-[#F5F5F5] pb-3 font-semibold">
              4. Diamonds & Gemstones Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {/* Diamonds */}
              <div className="border border-[#FAF6F0] bg-[#FAF9F6] p-5 rounded flex flex-col gap-4">
                <h4 className="font-serif font-bold text-[#9A7B4F] text-sm tracking-wide">Diamond Specifications</h4>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Diamond Type</label>
                  <input
                    type="text"
                    name="diamondType"
                    value={formData.diamondType}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. Round Brilliant, VVS"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total Weight (CTS)</label>
                  <input
                    type="text"
                    name="totalDiamondWeight"
                    value={formData.totalDiamondWeight}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. 0.45"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Diamond Shape</label>
                  <input
                    type="text"
                    name="diamondShape"
                    value={formData.diamondShape}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. Round, Oval, Princess"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Diamond Color</label>
                  <input
                    type="text"
                    name="diamondColor"
                    value={formData.diamondColor}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. D, E-F, G-H"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Clarity Grade</label>
                  <input
                    type="text"
                    name="diamondClarity"
                    value={formData.diamondClarity}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. FL, VVS1, VS2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Number of Diamonds</label>
                  <input
                    type="number"
                    name="numberOfDiamonds"
                    value={formData.numberOfDiamonds}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. 18"
                  />
                </div>
              </div>

              {/* Gemstones */}
              <div className="border border-[#FAF6F0] bg-[#FAF9F6] p-5 rounded flex flex-col gap-4">
                <h4 className="font-serif font-bold text-[#9A7B4F] text-sm tracking-wide">Gemstone Specifications</h4>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Gemstone Type</label>
                  <input
                    type="text"
                    name="gemstoneType"
                    value={formData.gemstoneType}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. Sapphire, Ruby, Emerald"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Gemstone Shape</label>
                  <input
                    type="text"
                    name="gemstoneShape"
                    value={formData.gemstoneShape}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. Oval, Cushion"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Gemstone Size</label>
                  <input
                    type="text"
                    name="gemstoneSize"
                    value={formData.gemstoneSize}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. 6x4 mm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total Weight (CTS)</label>
                  <input
                    type="text"
                    name="totalGemstoneWeight"
                    value={formData.totalGemstoneWeight}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. 1.20"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Number of Gemstones</label>
                  <input
                    type="number"
                    name="numberOfGemstones"
                    value={formData.numberOfGemstones}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-[#EAEAEA] px-3 py-2 text-xs focus:outline-none focus:border-[#9A7B4F] rounded text-[#1C1C1C]"
                    placeholder="e.g. 2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: DIMENSIONS & LOGISTICS */}
          <div className="bg-white border border-[#EAEAEA] p-6 md:p-8 rounded shadow-xs flex flex-col gap-6">
            <h3 className="font-serif text-lg text-[#1C1C1C] tracking-wide border-b border-[#F5F5F5] pb-3 font-semibold">
              5. Logistics & Dimensions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. India, South Africa"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Treatment</label>
                <input
                  type="text"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. Untreated, Heated"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Dimensions</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. 15 mm x 10 mm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ring Size</label>
                <input
                  type="text"
                  name="ringSize"
                  value={formData.ringSize}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. US 6 (resizable)"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Necklace Length</label>
                <input
                  type="text"
                  name="necklaceLength"
                  value={formData.necklaceLength}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. 16-18 inches adjustable"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Certification</label>
                <input
                  type="text"
                  name="certification"
                  value={formData.certification}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. GIA Certified, IGI Certified"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Hallmark Details</label>
                <input
                  type="text"
                  name="hallmarkDetails"
                  value={formData.hallmarkDetails}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. BIS Hallmarked 750 Gold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Shipping Info</label>
                <input
                  type="text"
                  name="shippingInfo"
                  value={formData.shippingInfo}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                  placeholder="e.g. Ships in 2 days. Insured delivery."
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: METADATA & SEO */}
          <div className="bg-white border border-[#EAEAEA] p-6 md:p-8 rounded shadow-xs flex flex-col gap-6">
            <h3 className="font-serif text-lg text-[#1C1C1C] tracking-wide border-b border-[#F5F5F5] pb-3 font-semibold">
              6. Metadata, tags & SEO
            </h3>

            <div className="flex flex-col gap-6 text-sm">
              {/* Dynamic Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Associated Tags</label>
                {loadingConfig ? (
                  <div className="h-10 w-full bg-[#F9F9F9] border border-[#EAEAEA] rounded animate-pulse" />
                ) : (
                  <div className="flex flex-wrap gap-2.5 p-4 border border-[#EAEAEA] bg-[#FAF9F6] rounded">
                    {tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground font-medium">No tags added yet. Manage them under the categories manager.</span>
                    ) : (
                      tags.map(t => {
                        const isSelected = formData.selectedTags.includes(t.name)
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleTagToggle(t.name)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                              isSelected 
                                ? "bg-[#9A7B4F] border-[#9A7B4F] text-white" 
                                : "bg-white border-[#EAEAEA] text-muted-foreground hover:border-[#9A7B4F] hover:text-[#9A7B4F]"
                            }`}
                          >
                            {t.name}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">SEO Meta Title</label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                    placeholder="Search engine optimize title..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">SEO Meta Description</label>
                  <input
                    type="text"
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
                    placeholder="Search engine optimize description..."
                  />
                </div>
              </div>

              {/* Slider features */}
              <div className="flex flex-col gap-4 pt-3 border-t border-[#F5F5F5]">
                <label className="flex items-center gap-3 text-xs uppercase tracking-widest font-bold text-[#1C1C1C] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    name="featured"
                    className="h-4.5 w-4.5 border-[#EAEAEA] bg-[#F9F9F9] accent-[#9A7B4F] rounded focus:ring-0 cursor-pointer"
                  />
                  <span>Feature on Homepage Slider (Feature It)</span>
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Product Highlights / Bullet Features (One item per line)</label>
                <textarea
                  name="details"
                  rows={4}
                  value={formData.details}
                  onChange={handleInputChange}
                  className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C] font-sans"
                  placeholder="e.g.&#10;18k gold&#10;Adjustable chain 16-18 inches&#10;Lobster clasp closure"
                />
              </div>
            </div>
          </div>

          {/* ACTIONS ROW */}
          <div className="flex gap-4 max-w-4xl mx-auto w-full mt-4">
            <Link
              href="/admin?tab=products"
              className="flex-1 text-center border border-[#EAEAEA] hover:bg-[#F9F9F9] text-[#1C1C1C] py-4 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 rounded bg-white"
            >
              Discard Changes
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#9A7B4F] hover:bg-[#856941] text-white py-4 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 duration-300 rounded shadow-xs"
            >
              {submitting ? "Registering SKU..." : "Save Product Details"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
