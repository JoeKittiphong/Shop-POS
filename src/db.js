import { openDB } from 'idb'

const DB_NAME = 'shop-pos-offline'
const DB_VERSION = 1
const PRODUCT_STORE = 'products'
const SALES_STORE = 'sales'

const sampleProducts = [
  { id: crypto.randomUUID(), name: 'น้ำเปล่า 600ml', price: 10, category: 'เครื่องดื่ม', image: '💧', featured: true, updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), name: 'โค้ก 325ml', price: 18, category: 'เครื่องดื่ม', image: '🥤', featured: true, updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), name: 'มาม่าหมูสับ', price: 8, category: 'อาหารแห้ง', image: '🍜', featured: true, updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), name: 'ขนมปังนมสด', price: 25, category: 'เบเกอรี่', image: '🍞', featured: true, updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), name: 'สบู่ก้อน', price: 22, category: 'ของใช้', image: '🧼', featured: true, updatedAt: new Date().toISOString() },
]

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const productStore = db.createObjectStore(PRODUCT_STORE, { keyPath: 'id' })
    productStore.createIndex('updatedAt', 'updatedAt')

    const salesStore = db.createObjectStore(SALES_STORE, { keyPath: 'id' })
    salesStore.createIndex('createdAt', 'createdAt')
  },
})

export async function getProducts() {
  const db = await dbPromise
  const products = await db.getAll(PRODUCT_STORE)
  return products.sort((a, b) => a.name.localeCompare(b.name, 'th'))
}

export async function saveProduct(product) {
  const db = await dbPromise
  const record = {
    id: product.id || crypto.randomUUID(),
    name: product.name,
    price: Number(product.price),
    category: product.category || '',
    image: product.image || '',
    featured: product.featured !== false,
    updatedAt: new Date().toISOString(),
  }
  await db.put(PRODUCT_STORE, record)
  return record
}

export async function deleteProduct(productId) {
  const db = await dbPromise
  await db.delete(PRODUCT_STORE, productId)
}

export async function seedDefaultProducts() {
  const db = await dbPromise
  const existing = await db.count(PRODUCT_STORE)
  if (existing > 0) {
    const currentProducts = await db.getAll(PRODUCT_STORE)
    const currentNames = new Set(currentProducts.map((product) => product.name))
    for (const product of sampleProducts) {
      if (!currentNames.has(product.name)) {
        await db.put(PRODUCT_STORE, { ...product, id: crypto.randomUUID() })
      }
    }
    return
  }

  for (const product of sampleProducts) {
    await db.put(PRODUCT_STORE, { ...product, id: crypto.randomUUID() })
  }
}

export async function getSales() {
  const db = await dbPromise
  const sales = await db.getAll(SALES_STORE)
  return sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createSale({ items, total, cash, change }) {
  const db = await dbPromise
  const sale = {
    id: `SALE-${Date.now()}`,
    createdAt: new Date().toISOString(),
    total: Number(total),
    cash: Number(cash),
    change: Number(change),
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
    })),
  }
  await db.put(SALES_STORE, sale)
  return sale
}

export async function deleteAllData() {
  const db = await dbPromise
  const tx = db.transaction([PRODUCT_STORE, SALES_STORE], 'readwrite')
  await tx.objectStore(PRODUCT_STORE).clear()
  await tx.objectStore(SALES_STORE).clear()
  await tx.done
}
