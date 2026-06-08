import fs from "fs"
import path from "path"
import { products as defaultProducts, Product } from "./products"

const dataDir = path.join(process.cwd(), "data")
const productsFile = path.join(dataDir, "products.json")
const contactsFile = path.join(dataDir, "contacts.json")

// Helper to ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true })
    } catch (e) {
      console.error("Failed to create data directory:", e)
    }
  }
}

// In-memory fallbacks for serverless environments (Vercel)
let inMemoryProducts: Product[] | null = null
let inMemoryContacts: ContactSubmission[] | null = null

export function readProducts(): Product[] {
  ensureDataDir()
  if (inMemoryProducts) {
    return inMemoryProducts
  }

  if (!fs.existsSync(productsFile)) {
    try {
      fs.writeFileSync(productsFile, JSON.stringify(defaultProducts, null, 2))
      return defaultProducts
    } catch (e) {
      console.warn("Could not write products file (probably read-only Vercel). Using defaultProducts in memory.")
      inMemoryProducts = defaultProducts
      return defaultProducts
    }
  }

  try {
    const data = fs.readFileSync(productsFile, "utf-8")
    const parsed = JSON.parse(data)
    inMemoryProducts = parsed
    return parsed
  } catch (e) {
    console.error("Failed to read products file, falling back to defaultProducts:", e)
    return defaultProducts
  }
}

export function writeProducts(products: Product[]) {
  ensureDataDir()
  inMemoryProducts = products
  try {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2))
  } catch (e) {
    console.error("Failed to write products to filesystem (e.g. read-only on Vercel):", e)
  }
}

export type ContactSubmission = {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  productInterest?: string
  createdAt: string
}

export function readContacts(): ContactSubmission[] {
  ensureDataDir()
  if (inMemoryContacts) {
    return inMemoryContacts
  }

  if (!fs.existsSync(contactsFile)) {
    try {
      fs.writeFileSync(contactsFile, JSON.stringify([], null, 2))
      return []
    } catch (e) {
      console.warn("Could not write contacts file. Using empty array in memory.")
      inMemoryContacts = []
      return []
    }
  }

  try {
    const data = fs.readFileSync(contactsFile, "utf-8")
    const parsed = JSON.parse(data)
    inMemoryContacts = parsed
    return parsed
  } catch (e) {
    console.error("Failed to read contacts file, falling back to empty array:", e)
    return []
  }
}

export function writeContacts(contacts: ContactSubmission[]) {
  ensureDataDir()
  inMemoryContacts = contacts
  try {
    fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2))
  } catch (e) {
    console.error("Failed to write contacts to filesystem (e.g. read-only on Vercel):", e)
  }
}
