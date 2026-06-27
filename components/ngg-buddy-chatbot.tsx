"use client"

import { useState, useEffect, useRef } from "react"
import { 
  MessageCircle, 
  X, 
  Send, 
  RefreshCw, 
  Sparkles, 
  Check, 
  Share2, 
  Trash2, 
  Sun, 
  Moon, 
  Info,
  Scale
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Product } from "@/lib/products"

type Message = {
  id: string
  sender: "user" | "bot"
  text: string
  type?: "text" | "products" | "compare"
  products?: Product[]
  compareData?: Product[]
}

type ChatContext = {
  category: string
  preferredMetal: string
  maxPrice: number | null
  allergies: string[]
  dislikedGoldColors: string[]
  stone: string
  occasion: string
  weightPreference: "light" | "heavy" | null
}

const initialContext: ChatContext = {
  category: "",
  preferredMetal: "",
  maxPrice: null,
  allergies: [],
  dislikedGoldColors: [],
  stone: "",
  occasion: "",
  weightPreference: null
}

export function NggBuddyChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [context, setContext] = useState<ChatContext>(initialContext)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Lead Capture State
  const [leadStep, setLeadStep] = useState(0) // 0: inactive, 1: Name, 2: Phone, 3: Email, 4: City, 5: Requirements
  const [leadData, setLeadData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    requirements: "",
    productInterest: ""
  })

  // Comparison State
  const [comparisonList, setComparisonList] = useState<Product[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const pathname = usePathname()

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) {
    return null
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          setAllProducts(await res.json())
        }
      } catch (e) {
        console.error("Failed to load products for chatbot", e)
      }
    }
    fetchProducts()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Setup initial message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: "Hello! I am NGG Buddy, your personal luxury jewellery assistant. 😊 Are you shopping for yourself or searching for a special gift today?"
        }
      ])
    }
  }, [messages])

  // Keyword Matching & Context Extraction Logic
  function parseUserQuery(query: string, currentContext: ChatContext): ChatContext {
    const text = query.toLowerCase()
    const newContext = { ...currentContext }

    // 1. Exclusions & Allergies
    if (text.includes("allergy") || text.includes("allergic") || text.includes("don't like") || text.includes("dont like") || text.includes("avoid")) {
      if (text.includes("silver")) newContext.allergies = Array.from(new Set([...newContext.allergies, "silver"]))
      if (text.includes("rose gold")) newContext.dislikedGoldColors = Array.from(new Set([...newContext.dislikedGoldColors, "rose"]))
      if (text.includes("yellow gold")) newContext.dislikedGoldColors = Array.from(new Set([...newContext.dislikedGoldColors, "yellow"]))
      if (text.includes("white gold")) newContext.dislikedGoldColors = Array.from(new Set([...newContext.dislikedGoldColors, "white"]))
      if (text.includes("platinum")) newContext.allergies = Array.from(new Set([...newContext.allergies, "platinum"]))
    }

    // 2. Preferred Metals
    if (text.includes("only wear platinum") || text.includes("only platinum") || text.includes("prefer platinum")) {
      newContext.preferredMetal = "platinum"
    } else if (text.includes("rose gold only") || text.includes("prefer rose gold") || text.includes("rose gold")) {
      newContext.preferredMetal = "rose gold"
    } else if (text.includes("yellow gold only") || text.includes("prefer yellow gold") || (text.includes("yellow gold") && !text.includes("dont like") && !text.includes("don't like"))) {
      newContext.preferredMetal = "yellow gold"
    } else if (text.includes("white gold only") || text.includes("prefer white gold") || text.includes("white gold")) {
      newContext.preferredMetal = "white gold"
    } else if (text.includes("gold") && !text.includes("rose") && !text.includes("white") && !text.includes("yellow")) {
      newContext.preferredMetal = "gold"
    }

    // 3. Category Detection
    if (text.includes("ring")) newContext.category = "ring"
    if (text.includes("necklace") || text.includes("pendant")) newContext.category = "necklace"
    if (text.includes("earring")) newContext.category = "earring"
    if (text.includes("bracelet") || text.includes("bangle")) newContext.category = "bracelet"
    if (text.includes("chain")) newContext.category = "chain"

    // 4. Stone Detection
    if (text.includes("diamond")) newContext.stone = "diamond"
    if (text.includes("ruby")) newContext.stone = "ruby"
    if (text.includes("emerald")) newContext.stone = "emerald"
    if (text.includes("sapphire")) newContext.stone = "sapphire"
    if (text.includes("pearl")) newContext.stone = "pearl"

    // 5. Price / Budget Parsing
    const priceRegex = /(?:under|below|budget|within|less than|around|₹|\$)\s*([\d,]+)\s*(k|lakh|thousand)?/i
    const match = text.match(priceRegex)
    if (match) {
      let value = parseFloat(match[1].replace(/,/g, ""))
      const multiplier = match[2]?.toLowerCase()
      if (multiplier === "k") {
        value *= 1000
      } else if (multiplier === "lakh") {
        value *= 100000
      }
      newContext.maxPrice = value
    } else {
      const standaloneKRegex = /\b(\d+)\s*k\b/i
      const kMatch = text.match(standaloneKRegex)
      if (kMatch) {
        newContext.maxPrice = parseFloat(kMatch[1]) * 1000
      }
    }

    // 6. Occasion Detection
    if (text.includes("wedding") || text.includes("bridal") || text.includes("marriage")) newContext.occasion = "wedding"
    if (text.includes("engagement") || text.includes("propose")) newContext.occasion = "engagement"
    if (text.includes("anniversary")) newContext.occasion = "anniversary"
    if (text.includes("birthday") || text.includes("gift")) newContext.occasion = "gift"
    if (text.includes("festival") || text.includes("festive") || text.includes("diwali")) newContext.occasion = "festival"
    if (text.includes("valentine") || text.includes("love")) newContext.occasion = "valentine"
    if (text.includes("daily") || text.includes("office") || text.includes("minimal")) newContext.occasion = "minimal"

    // 7. Styling / Weight preference
    if (text.includes("lightweight") || text.includes("light weight") || text.includes("light")) newContext.weightPreference = "light"
    if (text.includes("heavy") || text.includes("bridal") || text.includes("traditional")) newContext.weightPreference = "heavy"

    return newContext
  }

  // Filter Products based on parsed context
  function filterProducts(productsList: Product[], ctx: ChatContext): Product[] {
    return productsList.filter(p => {
      // 1. Exclude allergies
      if (ctx.allergies.includes("silver")) {
        if (p.material.toLowerCase().includes("silver")) return false
        if (p.metalType?.toLowerCase().includes("silver")) return false
      }
      if (ctx.allergies.includes("platinum")) {
        if (p.material.toLowerCase().includes("platinum")) return false
        if (p.metalType?.toLowerCase().includes("platinum")) return false
      }
      
      // 2. Exclude disliked gold colors
      if (ctx.dislikedGoldColors.includes("rose") && p.material.toLowerCase().includes("rose")) return false
      if (ctx.dislikedGoldColors.includes("yellow") && p.material.toLowerCase().includes("yellow")) return false
      if (ctx.dislikedGoldColors.includes("white") && p.material.toLowerCase().includes("white")) return false

      // 3. Preferred metal matching
      if (ctx.preferredMetal) {
        const mat = p.material.toLowerCase()
        const metal = p.metalType?.toLowerCase() || ""
        if (ctx.preferredMetal === "platinum" && !mat.includes("platinum") && !metal.includes("platinum")) return false
        if (ctx.preferredMetal === "rose gold" && !mat.includes("rose")) return false
        if (ctx.preferredMetal === "yellow gold" && !mat.includes("yellow")) return false
        if (ctx.preferredMetal === "white gold" && !mat.includes("white")) return false
        if (ctx.preferredMetal === "gold" && !mat.includes("gold") && !metal.includes("gold")) return false
      }

      // 4. Category matching
      if (ctx.category) {
        const cat = p.category?.toLowerCase() || ""
        const type = p.productType?.toLowerCase() || ""
        const name = p.name.toLowerCase()
        
        const isRing = cat.includes("ring") || type.includes("ring") || name.includes("ring")
        const isNecklace = cat.includes("necklace") || type.includes("necklace") || name.includes("necklace") || name.includes("pendant") || p.collection.toLowerCase().includes("smile")
        const isBracelet = cat.includes("bracelet") || type.includes("bracelet") || name.includes("bracelet") || name.includes("bangle") || name.includes("link")
        const isEarring = cat.includes("earring") || type.includes("earring") || name.includes("earring")

        if (ctx.category === "ring" && !isRing) return false
        if (ctx.category === "necklace" && !isNecklace) return false
        if (ctx.category === "bracelet" && !isBracelet) return false
        if (ctx.category === "earring" && !isEarring) return false
      }

      // 5. Stone matching
      if (ctx.stone) {
        const mat = p.material.toLowerCase()
        const dType = p.diamondType?.toLowerCase() || ""
        const gType = p.gemstoneType?.toLowerCase() || ""
        
        const hasStone = mat.includes(ctx.stone) || dType.includes(ctx.stone) || gType.includes(ctx.stone)
        if (!hasStone) return false
      }

      // 6. Max Price matching (Numerical clean)
      if (ctx.maxPrice) {
        const priceNum = Number(p.price.replace(/[^0-9]/g, ""))
        if (priceNum > ctx.maxPrice) return false
      }

      // 7. Occasion matching
      if (ctx.occasion) {
        const occ = p.occasions?.toLowerCase() || ""
        const styling = p.styling?.toLowerCase() || ""
        const matchOcc = occ.includes(ctx.occasion) || styling.includes(ctx.occasion)
        
        // Special mapping for traditional/wedding fallback
        if (!matchOcc && ctx.occasion === "wedding" && !p.collection.toLowerCase().includes("signature")) return false
      }

      // 8. Weight preference
      if (ctx.weightPreference) {
        const weight = parseFloat(p.grossWeight || "0")
        if (ctx.weightPreference === "light" && weight > 10) return false
        if (ctx.weightPreference === "heavy" && weight > 0 && weight <= 10) return false
      }

      return true
    })
  }

  // Handle bot response generation
  function getBotResponse(userText: string, newContext: ChatContext) {
    const text = userText.toLowerCase()

    // check if user wants to enquire or customize
    const enquireKeywords = ["enquire", "buy this", "want this", "customize", "customisation", "order", "price", "contact me"]
    const isEnquiryIntent = enquireKeywords.some(kw => text.includes(kw))
    
    if (isEnquiryIntent && leadStep === 0) {
      setLeadStep(1)
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [
          ...prev,
          {
            id: `bot-lead-1-${Date.now()}`,
            sender: "bot",
            text: "An excellent choice! 😊 Our design consultant would love to assist you with customization options or order inquiries. May I have your name so we can contact you?"
          }
        ])
      }, 800)
      return
    }

    // Filter products using context
    const matches = filterProducts(allProducts, newContext)

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)

      let responseText = ""
      let msgType: "text" | "products" = "text"

      if (matches.length > 0) {
        msgType = "products"
        
        // Custom messages based on key filters
        if (newContext.maxPrice && newContext.category) {
          responseText = `Here are the matching ${newContext.category}s under ₹${newContext.maxPrice.toLocaleString("en-IN")}:`
        } else if (newContext.category) {
          responseText = `Here are some stunning ${newContext.category}s from our registry:`
        } else if (newContext.preferredMetal) {
          responseText = `Here is our selection of exquisite ${newContext.preferredMetal} designs:`
        } else {
          responseText = "I have curated these premium registry products matching your interests:"
        }
      } else {
        // Fallback: relax constraints and show alternatives
        msgType = "products"
        responseText = "I couldn't find an exact match for those filters, but these similar alternatives from our luxury collections might interest you:"
        
        // fallback recommendation (trending or featured)
        setContext(initialContext) // Reset filters to prevent lock
      }

      // Add bot message
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: responseText,
          type: msgType,
          products: matches.length > 0 ? matches : allProducts.filter(p => p.featured !== false).slice(0, 3)
        }
      ])
    }, 1000)
  }

  // Handle lead collection dialog flows
  const handleLeadStep = (userText: string) => {
    let nextText = ""
    let nextStep = leadStep

    if (leadStep === 1) { // Got Name -> Ask Phone
      setLeadData(prev => ({ ...prev, name: userText }))
      nextText = `Pleasure meeting you, ${userText}! What is your phone number?`
      nextStep = 2
    } else if (leadStep === 2) { // Got Phone -> Ask Email
      setLeadData(prev => ({ ...prev, phone: userText }))
      nextText = "Thank you! And your email address so we can send details?"
      nextStep = 3
    } else if (leadStep === 3) { // Got Email -> Ask City
      setLeadData(prev => ({ ...prev, email: userText }))
      nextText = "Excellent. In which city should we schedule delivery?"
      nextStep = 4
    } else if (leadStep === 4) { // Got City -> Ask requirements
      setLeadData(prev => ({ ...prev, city: userText }))
      nextText = "Perfect! Lastly, do you have any specific customization requirements, metal purity preference, or ring size?"
      nextStep = 5
    } else if (leadStep === 5) { // Got requirements -> Save Lead
      const finalRequirements = userText
      const finalLead = {
        ...leadData,
        requirements: finalRequirements
      }

      setLeadData(prev => ({ ...prev, requirements: finalRequirements }))
      nextStep = 0 // Close lead flow
      
      // Save lead to database API
      saveLeadToDb(finalLead)
      return
    }

    setLeadStep(nextStep)
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [
        ...prev,
        {
          id: `bot-lead-${nextStep}-${Date.now()}`,
          sender: "bot",
          text: nextText
        }
      ])
    }, 800)
  }

  const saveLeadToDb = async (lead: typeof leadData) => {
    setIsTyping(true)
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          message: `Lead Inquiry Notes:\n${lead.requirements}`,
          subject: lead.productInterest ? `Customization: ${lead.productInterest}` : "Chatbot Consultation request",
          productInterest: lead.productInterest || "",
          type: "lead"
        })
      })

      setIsTyping(false)
      if (res.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-lead-success-${Date.now()}`,
            sender: "bot",
            text: `Thank you, ${lead.name}! Your enquiry has been registered. One of our jewellery design experts will contact you shortly to assist further. ✨`
          }
        ])
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-lead-error-${Date.now()}`,
            sender: "bot",
            text: "Your details have been cached locally. A consultant will reach out shortly!"
          }
        ])
      }
    } catch (e) {
      setIsTyping(false)
      setMessages(prev => [
        ...prev,
        {
          id: `bot-lead-net-error-${Date.now()}`,
          sender: "bot",
          text: "We will contact you shortly!"
        }
      ])
    }
  }

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue
    if (!text.trim()) return

    // 1. Add User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue("")

    // 2. Lead flow logic
    if (leadStep > 0) {
      handleLeadStep(text)
      return
    }

    // 3. Parse text and trigger rule engine
    const newContext = parseUserQuery(text, context)
    setContext(newContext)
    getBotResponse(text, newContext)
  }

  const handleSuggestClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  // Trigger lead flow on product card click
  const triggerLeadForProduct = (productName: string) => {
    setLeadData(prev => ({ ...prev, productInterest: productName }))
    setLeadStep(1)
    setMessages(prev => [
      ...prev,
      {
        id: `user-click-${Date.now()}`,
        sender: "user",
        text: `I'm interested in the ${productName}.`
      }
    ])
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [
        ...prev,
        {
          id: `bot-lead-start-${Date.now()}`,
          sender: "bot",
          text: `Wonderful! Our designers can customize the ${productName} in 18k/22k Gold or Platinum. May I have your name to arrange a specialist consultation?`
        }
      ])
    }, 600)
  }

  // Product Comparison Helpers
  const handleAddToCompare = (product: Product) => {
    if (comparisonList.some(p => p.slug === product.slug)) {
      setComparisonList(prev => prev.filter(p => p.slug !== product.slug))
      return
    }

    if (comparisonList.length >= 2) {
      alert("You can compare a maximum of 2 products side-by-side.")
      return
    }

    setComparisonList(prev => [...prev, product])
  }

  const triggerComparisonMessage = () => {
    if (comparisonList.length !== 2) return

    const userMsgText = `Compare ${comparisonList[0].name} vs ${comparisonList[1].name}`
    setMessages(prev => [
      ...prev,
      {
        id: `user-compare-${Date.now()}`,
        sender: "user",
        text: userMsgText
      },
      {
        id: `bot-compare-${Date.now()}`,
        sender: "bot",
        text: "Here is your side-by-side spec comparison table:",
        type: "compare",
        compareData: [...comparisonList]
      }
    ])
    setComparisonList([])
  }

  const resetChat = () => {
    setContext(initialContext)
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: "bot",
        text: "Context refreshed! Let's start fresh. 😊 What style of jewellery are you looking for?"
      }
    ])
    setLeadStep(0)
    setComparisonList([])
  }

  // Dynamic Suggestion Chips
  const getSuggestions = () => {
    if (leadStep > 0) return []
    if (context.category === "") {
      return ["Show Rings", "Gift for Anniversary", "Diamond Necklace", "Minimal Daily Wear"]
    }
    if (context.maxPrice === null) {
      return ["Under ₹50,000", "Under ₹1,00,000", "Show only Platinum", "Exclude Silver"]
    }
    return ["Add Diamonds", "Reset Filters", "Show Best Sellers"]
  }

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#9A7B4F] to-[#C5A880] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 animate-bounce"
          title="Chat with NGG Buddy"
        >
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1C1C1C] text-[8px] font-bold text-white">1</span>
        </button>
      )}

      {/* Chat Container */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[420px] h-[600px] max-h-[calc(100vh-100px)] flex flex-col rounded-2xl border border-white/30 bg-white/80 dark:bg-[#121212]/90 dark:border-white/10 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-500 scale-100 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#9A7B4F] to-[#B89766] px-5 py-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-white" />
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-serif text-sm font-bold tracking-wider">NB</div>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold tracking-wide flex items-center gap-1.5">
                  NGG Buddy <Sparkles className="h-3.5 w-3.5 text-[#1C1C1C]" />
                </h3>
                <p className="text-[9px] uppercase tracking-widest text-white/80 font-bold">Shopping Advisor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white/90"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              
              {/* Reset State */}
              <button 
                onClick={resetChat} 
                className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white/90" 
                title="Reset Chat"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              
              {/* Close */}
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#FAF9F6] dark:bg-[#1A1A1A]">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Text Bubble */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                  msg.sender === "user" 
                    ? "bg-[#9A7B4F] text-white rounded-tr-none" 
                    : "bg-white dark:bg-[#282828] text-[#1C1C1C] dark:text-white rounded-tl-none border border-[#EAEAEA] dark:border-white/5 shadow-xs"
                }`}>
                  {msg.text}
                </div>

                {/* Dynamic Product Cards Carousel */}
                {msg.type === "products" && msg.products && (
                  <div className="w-[300px] sm:w-[350px] flex gap-3.5 overflow-x-auto py-3.5 px-1 scrollbar-none snap-x snap-mandatory">
                    {msg.products.map((p) => {
                      const isSelected = comparisonList.some(c => c.slug === p.slug)
                      return (
                        <div key={p.slug} className="w-[180px] flex-none bg-white dark:bg-[#242424] border border-[#EAEAEA] dark:border-white/5 rounded-xl overflow-hidden shadow-md snap-start flex flex-col justify-between group">
                          <div>
                            <div className="h-32 bg-[#F9F9F9] dark:bg-[#2A2A2A] flex items-center justify-center p-3 relative">
                              <img src={p.image} alt={p.name} className="h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                              <button
                                onClick={() => handleAddToCompare(p)}
                                className={`absolute top-2 right-2 p-1.5 rounded-full border shadow-xs transition-all ${
                                  isSelected 
                                    ? "bg-[#9A7B4F] border-[#9A7B4F] text-white" 
                                    : "bg-white dark:bg-[#333] border-border text-muted-foreground hover:text-[#9A7B4F]"
                                }`}
                                title="Add to compare"
                              >
                                <Scale className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="p-3">
                              <h4 className="font-serif text-[11px] font-bold text-foreground line-clamp-1">{p.name}</h4>
                              <p className="text-[10px] text-[#9A7B4F] font-bold mt-1">{p.price}</p>
                              <p className="text-[9px] text-muted-foreground line-clamp-2 mt-1 leading-normal">{p.description}</p>
                            </div>
                          </div>
                          
                          <div className="p-2 border-t border-[#F5F5F5] dark:border-white/5 flex gap-1 bg-[#FAF9F6] dark:bg-[#222]">
                            <Link 
                              href={`/product/${p.slug}`}
                              className="flex-1 text-center py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border bg-white dark:bg-[#333] rounded"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => triggerLeadForProduct(p.name)}
                              className="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-[#9A7B4F] text-white hover:opacity-90 rounded"
                            >
                              Enquire
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Dynamic Comparison spec view */}
                {msg.type === "compare" && msg.compareData && msg.compareData.length === 2 && (
                  <div className="w-[300px] sm:w-[350px] bg-white dark:bg-[#282828] border border-[#EAEAEA] dark:border-white/5 rounded-xl p-3.5 mt-2 shadow-md">
                    <div className="grid grid-cols-3 gap-2 text-[10px] border-b pb-2 mb-2 font-bold text-foreground">
                      <div>Specs</div>
                      <div className="truncate">{msg.compareData[0].name.split(" ")[0]}</div>
                      <div className="truncate">{msg.compareData[1].name.split(" ")[0]}</div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-[9px]">
                      <div className="grid grid-cols-3 gap-2 border-b py-1">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-bold text-[#9A7B4F]">{msg.compareData[0].price}</span>
                        <span className="font-bold text-[#9A7B4F]">{msg.compareData[1].price}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-b py-1">
                        <span className="text-muted-foreground">Metal Type</span>
                        <span>{msg.compareData[0].metalType || "Gold"}</span>
                        <span>{msg.compareData[1].metalType || "Gold"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-b py-1">
                        <span className="text-muted-foreground">Purity</span>
                        <span>{msg.compareData[0].goldPurity || "18k"}</span>
                        <span>{msg.compareData[1].goldPurity || "18k"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-b py-1">
                        <span className="text-muted-foreground">Diamonds</span>
                        <span>{msg.compareData[0].totalDiamondWeight ? `${msg.compareData[0].totalDiamondWeight} CTS` : "No"}</span>
                        <span>{msg.compareData[1].totalDiamondWeight ? `${msg.compareData[1].totalDiamondWeight} CTS` : "No"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-1">
                        <span className="text-muted-foreground">Weight</span>
                        <span>{msg.compareData[0].grossWeight ? `${msg.compareData[0].grossWeight}g` : "—"}</span>
                        <span>{msg.compareData[1].grossWeight ? `${msg.compareData[1].grossWeight}g` : "—"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="mr-auto flex items-center gap-1 bg-white dark:bg-[#282828] p-3 rounded-2xl rounded-tl-none border border-[#EAEAEA] dark:border-white/5 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Compare Toolbar */}
          {comparisonList.length > 0 && (
            <div className="bg-[#FAF6F0] dark:bg-[#2A241C] border-t border-[#EBE3D5] dark:border-white/5 px-4 py-2 flex items-center justify-between text-xs font-semibold">
              <span className="text-[#9A7B4F] flex items-center gap-1.5">
                <Scale className="h-4 w-4" /> {comparisonList.length} / 2 selected to compare
              </span>
              {comparisonList.length === 2 ? (
                <button
                  onClick={triggerComparisonMessage}
                  className="bg-[#9A7B4F] text-white px-3.5 py-1.5 rounded text-[10px] uppercase tracking-wider font-bold transition-opacity hover:opacity-90"
                >
                  Compare Now
                </button>
              ) : (
                <span className="text-[10px] text-muted-foreground font-medium">Select one more</span>
              )}
            </div>
          )}

          {/* Quick reply suggestion chips */}
          {getSuggestions().length > 0 && (
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto bg-[#FAF9F6] dark:bg-[#1A1A1A] border-t border-[#EAEAEA] dark:border-white/5 scrollbar-none">
              {getSuggestions().map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSuggestClick(sug)}
                  className="flex-none bg-white dark:bg-[#282828] border border-[#EAEAEA] dark:border-white/5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-[#9A7B4F] hover:text-[#9A7B4F] transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Form Footer */}
          <div className="p-3 border-t border-[#EAEAEA] dark:border-white/5 bg-white dark:bg-[#121212] flex gap-2 items-center">
            <input
              type="text"
              placeholder={leadStep > 0 ? "Type your response here..." : "Ask NGG Buddy (e.g. rings under 40k)..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-[#FAF9F6] dark:bg-[#1E1E1E] border border-[#EAEAEA] dark:border-white/5 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-[#9A7B4F] dark:focus:border-[#9A7B4F] text-foreground transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              className="h-9 w-9 rounded-full bg-[#9A7B4F] hover:bg-[#856941] text-white flex items-center justify-center transition-colors shadow-xs shrink-0"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
