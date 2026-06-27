"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Search, X, Check, ImageIcon, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react"

type WPImage = {
  id: number
  url: string
  title: string
  thumbnail: string
  medium: string
  width: number
  height: number
}

type Props = {
  value: string | string[]
  onSelect: (url: any) => void
  label?: string
  required?: boolean
  multiple?: boolean
}

export function ImageUploader({ value, onSelect, label = "Image", required = false, multiple = false }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"library" | "upload">("library")

  // Library state
  const [images, setImages] = useState<WPImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState<WPImage | null>(null)
  const [selectedList, setSelectedList] = useState<WPImage[]>([])

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchImages = useCallback(async (p = 1, q = "") => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ page: String(p), ...(q ? { search: q } : {}) })
      const res = await fetch(`/api/media?${params}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load media")
      setImages(data.images || [])
      setTotalPages(data.totalPages || 1)
      setPage(p)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && tab === "library") {
      fetchImages(1, search)
    }
  }, [open, tab])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchImages(1, search)
  }

  const handleUploadFile = async (file: File) => {
    setUploading(true)
    setUploadError("")
    setUploadSuccess("")
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/media", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setUploadSuccess(`✅ "${file.name}" uploaded successfully!`)
      // Switch to library and refresh
      setTab("library")
      fetchImages(1, "")
    } catch (e: any) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUploadFile(file)
  }

  const handleDeleteImage = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this image from your Media Library? This action cannot be undone.")) {
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Failed to delete image")
      } else {
        setSelected(null)
        fetchImages(page, search)
      }
    } catch (e: any) {
      alert("Failed to delete image due to a network issue.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMultipleImages = async () => {
    if (selectedList.length === 0) return

    const confirmMsg = `Are you sure you want to permanently delete these ${selectedList.length} selected images from your Media Library? This action cannot be undone.`
    if (!window.confirm(confirmMsg)) {
      return
    }

    setLoading(true)
    let failedCount = 0

    try {
      await Promise.all(
        selectedList.map(async (item) => {
          try {
            const res = await fetch(`/api/media?id=${item.id}`, {
              method: "DELETE"
            })
            if (!res.ok) {
              failedCount++
            }
          } catch (_) {
            failedCount++
          }
        })
      )

      if (failedCount > 0) {
        alert(`Finished bulk delete operations. ${failedCount} of the selected images failed to delete.`)
      }

      setSelectedList([])
      fetchImages(page, search)
    } catch (e: any) {
      alert("Bulk delete operations failed due to a network communication issue.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (multiple) {
      if (selectedList.length > 0) {
        onSelect(selectedList.map(img => img.url))
        setOpen(false)
        setSelectedList([])
      }
    } else {
      if (selected) {
        onSelect(selected.url)
        setOpen(false)
        setSelected(null)
      }
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelected(null)
    setSelectedList([])
    setSearch("")
    setUploadError("")
    setUploadSuccess("")
  }

  return (
    <>
      {/* Trigger field */}
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            {label}{required && " *"}
          </label>
        )}
        <div className="flex gap-2 items-start">
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#9A7B4F] transition-all rounded text-[#1C1C1C]"
              placeholder="Paste URL or use Browse button →"
            />
            {value && (
              <img
                src={value}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border border-[#EAEAEA] shadow-xs"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-[#9A7B4F] hover:bg-[#856941] text-white px-4 py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 shadow-xs"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Browse
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative z-10 w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-[#EAEAEA] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA] shrink-0">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-[#9A7B4F]" />
                <h2 className="font-serif text-xl text-[#1C1C1C] font-semibold tracking-wide">Media Library</h2>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-[#1C1C1C] transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#EAEAEA] shrink-0 px-6">
              <button
                onClick={() => setTab("library")}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  tab === "library"
                    ? "border-[#9A7B4F] text-[#9A7B4F]"
                    : "border-transparent text-muted-foreground hover:text-[#1C1C1C]"
                }`}
              >
                📂 Media Library
              </button>
              <button
                onClick={() => setTab("upload")}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  tab === "upload"
                    ? "border-[#9A7B4F] text-[#9A7B4F]"
                    : "border-transparent text-muted-foreground hover:text-[#1C1C1C]"
                }`}
              >
                ⬆️ Upload New
              </button>
            </div>

            {/* LIBRARY TAB */}
            {tab === "library" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Search bar */}
                <div className="px-6 py-3 border-b border-[#F5F5F5] shrink-0">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search images..."
                        className="w-full pl-9 pr-4 py-2 text-xs bg-[#F9F9F9] border border-[#EAEAEA] rounded focus:outline-none focus:border-[#9A7B4F] transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#F9F9F9] border border-[#EAEAEA] px-4 py-2 text-xs font-semibold rounded hover:bg-[#F0EDE8] transition-colors"
                    >
                      Search
                    </button>
                    {search && (
                      <button
                        type="button"
                        onClick={() => { setSearch(""); fetchImages(1, "") }}
                        className="text-xs text-muted-foreground hover:text-[#9A7B4F] px-2 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </form>
                </div>

                {/* Image Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 className="h-8 w-8 text-[#9A7B4F] animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                      <AlertCircle className="h-8 w-8 text-red-400" />
                      <p className="text-sm text-red-600 font-medium">{error}</p>
                      <button
                        onClick={() => fetchImages(1, search)}
                        className="text-xs text-[#9A7B4F] underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground font-medium">No images found</p>
                      <button
                        onClick={() => setTab("upload")}
                        className="text-xs text-[#9A7B4F] underline"
                      >
                        Upload your first image
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                      {images.map((img) => {
                        const isSelected = multiple
                          ? selectedList.some((item) => item.id === img.id)
                          : selected?.id === img.id

                        const handleSelectClick = () => {
                          if (multiple) {
                            const exists = selectedList.some((item) => item.id === img.id)
                            if (exists) {
                              setSelectedList(selectedList.filter((item) => item.id !== img.id))
                            } else {
                              setSelectedList([...selectedList, img])
                            }
                          } else {
                            setSelected(selected?.id === img.id ? null : img)
                          }
                        }

                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={handleSelectClick}
                            className={`relative aspect-square rounded overflow-hidden border-2 transition-all group ${
                              isSelected
                                ? "border-[#9A7B4F] ring-2 ring-[#9A7B4F]/30 scale-[0.97]"
                                : "border-[#EAEAEA] hover:border-[#9A7B4F]/50"
                            }`}
                          >
                            <img
                              src={img.thumbnail || img.url}
                              alt={img.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#9A7B4F]/20 flex items-center justify-center">
                                <div className="bg-[#9A7B4F] rounded-full p-1">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Selected image info + pagination */}
                <div className="px-6 py-3 border-t border-[#EAEAEA] shrink-0 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {multiple ? (
                      selectedList.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-3 overflow-hidden shrink-0">
                            {selectedList.slice(0, 3).map((item, idx) => (
                              <img
                                key={item.id}
                                src={item.thumbnail}
                                alt=""
                                className="h-8 w-8 object-cover rounded border border-[#EAEAEA] ring-2 ring-white"
                              />
                            ))}
                            {selectedList.length > 3 && (
                              <div className="flex items-center justify-center h-8 w-8 rounded bg-[#FAF9F6] border border-[#EAEAEA] text-[9px] font-bold text-muted-foreground ring-2 ring-white shrink-0">
                                +{selectedList.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#1C1C1C]">{selectedList.length} selected</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {selectedList.map((item) => item.title).join(", ")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedList([])}
                            className="text-xs text-muted-foreground hover:text-foreground underline font-semibold px-2"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteMultipleImages}
                            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider rounded transition-colors shrink-0"
                          >
                            Delete Selected
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground font-medium">Select images from the library</p>
                      )
                    ) : selected ? (
                      <div className="flex items-center gap-3">
                        <img src={selected.thumbnail} alt="" className="h-10 w-10 object-cover rounded border border-[#EAEAEA]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#1C1C1C] truncate">{selected.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{selected.url}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(selected.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded transition-colors shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Click an image to select it</p>
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={page <= 1 || loading}
                      onClick={() => fetchImages(page - 1, search)}
                      className="p-1.5 rounded border border-[#EAEAEA] disabled:opacity-40 hover:bg-[#F9F9F9] transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages || loading}
                      onClick={() => fetchImages(page + 1, search)}
                      className="p-1.5 rounded border border-[#EAEAEA] disabled:opacity-40 hover:bg-[#F9F9F9] transition-colors"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={multiple ? selectedList.length === 0 : !selected}
                    onClick={handleConfirm}
                    className="bg-[#9A7B4F] hover:bg-[#856941] disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0"
                  >
                    {multiple ? "Use Selected Images" : "Use Selected Image"}
                  </button>
                </div>
              </div>
            )}

            {/* UPLOAD TAB */}
            {tab === "upload" && (
              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                    dragOver
                      ? "border-[#9A7B4F] bg-[#FAF6F0]"
                      : "border-[#EAEAEA] hover:border-[#9A7B4F]/50 hover:bg-[#FAF9F6]"
                  } ${uploading ? "pointer-events-none opacity-70" : ""}`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-12 w-12 text-[#9A7B4F] animate-spin" />
                      <p className="text-sm font-semibold text-[#9A7B4F]">Uploading to WordPress...</p>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#FAF6F0] rounded-full p-4">
                        <Upload className="h-8 w-8 text-[#9A7B4F]" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-[#1C1C1C]">
                          {dragOver ? "Drop to upload" : "Drag & drop or click to browse"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF — Max 10MB</p>
                      </div>
                      <button
                        type="button"
                        className="bg-[#9A7B4F] text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#856941] transition-colors"
                      >
                        Choose File
                      </button>
                    </>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-3 rounded font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" />
                    {uploadSuccess}
                  </div>
                )}

                <div className="bg-[#FAF9F6] border border-[#EBE3D5] rounded p-4">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-2">Note</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Images are uploaded directly to your WordPress hosting on Hostinger. After upload, the image will appear in your WordPress Media Library and be available for selection here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
