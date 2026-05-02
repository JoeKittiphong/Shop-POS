import { useEffect, useMemo, useState } from 'react'
import {
  createSale,
  deleteAllData,
  deleteProduct,
  getProducts,
  getSales,
  saveProduct,
  seedDefaultProducts,
} from '../db'
import {
  defaultCategory,
  defaultProductMessage,
  defaultSellMessage,
  initialProductForm,
} from '../constants/pos'

export function usePosData() {
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [cart, setCart] = useState([])
  const [productForm, setProductForm] = useState(initialProductForm)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory)
  const [cashReceived, setCashReceived] = useState('')
  const [activeTab, setActiveTab] = useState('sell')
  const [saleMessage, setSaleMessage] = useState(defaultSellMessage)
  const [productMessage, setProductMessage] = useState(defaultProductMessage)
  const [isBusy, setIsBusy] = useState(true)

  useEffect(() => {
    void loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const category = product.category?.trim() || 'ทั่วไป'
      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        category.toLowerCase().includes(keyword)
      const matchesCategory = selectedCategory === defaultCategory || category === selectedCategory

      return (
        matchesSearch &&
        matchesCategory &&
        (product.featured || keyword || selectedCategory !== defaultCategory)
      )
    })
  }, [products, searchTerm, selectedCategory])

  const categories = useMemo(() => {
    const values = new Set(products.map((product) => product.category?.trim() || 'ทั่วไป'))
    return [defaultCategory, ...Array.from(values).sort((a, b) => a.localeCompare(b, 'th'))]
  }, [products])

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )

  const change = useMemo(() => {
    const cash = Number(cashReceived || 0)
    return Math.max(cash - subtotal, 0)
  }, [cashReceived, subtotal])

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const totalSalesValue = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.total, 0),
    [sales],
  )

  const isSellPage = activeTab === 'sell'

  async function loadData() {
    setIsBusy(true)
    try {
      const [loadedProducts, loadedSales] = await Promise.all([getProducts(), getSales()])
      setProducts(loadedProducts)
      setSales(loadedSales)
    } finally {
      setIsBusy(false)
    }
  }

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === product.id)
      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]
    })
  }

  function updateCartQuantity(productId, delta) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function removeCartItem(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.productId !== productId))
  }

  function resetCart() {
    setCart([])
    setCashReceived('')
    setSaleMessage('ล้างบิลเรียบร้อย')
  }

  async function submitProductForm() {
    const name = productForm.name.trim()
    const category = productForm.category.trim()
    const image = productForm.image.trim()
    const price = Number(productForm.price)

    if (!name || Number.isNaN(price) || price < 0) {
      setProductMessage('กรอกชื่อสินค้าและราคาให้ครบก่อน')
      return false
    }

    await saveProduct({
      id: productForm.id || undefined,
      name,
      price,
      category,
      image,
      featured: productForm.featured,
    })

    setProductForm(initialProductForm)
    setProductMessage(productForm.id ? 'อัปเดตสินค้าแล้ว' : 'เพิ่มสินค้าใหม่แล้ว')
    await loadData()
    return true
  }

  function startEditingProduct(product) {
    setProductForm({
      id: product.id,
      name: product.name,
      price: String(product.price),
      category: product.category || '',
      image: product.image || '',
      featured: Boolean(product.featured),
    })
    setProductMessage(`กำลังแก้ไข ${product.name}`)
    setActiveTab('products')
  }

  function resetProductForm() {
    setProductForm(initialProductForm)
  }

  async function loadSampleProducts() {
    await seedDefaultProducts()
    setProductMessage('โหลดข้อมูลตัวอย่างเรียบร้อย')
    await loadData()
  }

  async function removeProduct(productId) {
    const confirmed = window.confirm('ต้องการลบสินค้านี้ใช่ไหม')
    if (!confirmed) {
      return false
    }

    await deleteProduct(productId)

    if (productForm.id === productId) {
      setProductForm(initialProductForm)
    }

    setProductMessage('ลบสินค้าแล้ว')
    await loadData()
    return true
  }

  async function checkout() {
    if (!cart.length) {
      setSaleMessage('ยังไม่มีสินค้าในบิล')
      return false
    }

    const cash = Number(cashReceived || 0)
    if (cash < subtotal) {
      setSaleMessage('จำนวนเงินรับต้องมากกว่าหรือเท่ากับยอดรวม')
      return false
    }

    const sale = await createSale({
      items: cart,
      total: subtotal,
      cash,
      change,
    })

    setCart([])
    setCashReceived('')
    setSaleMessage(`บันทึกการขาย ${sale.id} แล้ว`)
    setActiveTab('sales')
    await loadData()
    return true
  }

  async function clearAllData() {
    const confirmed = window.confirm('ต้องการลบข้อมูลสินค้าและประวัติการขายทั้งหมดในเครื่องนี้ใช่ไหม')
    if (!confirmed) {
      return false
    }

    await deleteAllData()
    setCart([])
    setCashReceived('')
    setProductForm(initialProductForm)
    setSaleMessage('ล้างข้อมูลทั้งหมดแล้ว')
    setProductMessage('เริ่มใหม่เรียบร้อย')
    await loadData()
    return true
  }

  function printBill() {
    if (!cart.length) {
      setSaleMessage('ยังไม่มีสินค้าในบิลสำหรับพิมพ์')
      return false
    }

    window.print()
    return true
  }

  return {
    activeTab,
    cart,
    cashReceived,
    categories,
    change,
    filteredProducts,
    isBusy,
    isSellPage,
    productForm,
    productMessage,
    products,
    saleMessage,
    sales,
    searchTerm,
    selectedCategory,
    subtotal,
    totalItems,
    totalSalesValue,
    setActiveTab,
    setCashReceived,
    setProductForm,
    setSearchTerm,
    setSelectedCategory,
    addToCart,
    checkout,
    clearAllData,
    loadSampleProducts,
    printBill,
    removeCartItem,
    removeProduct,
    resetCart,
    resetProductForm,
    startEditingProduct,
    submitProductForm,
    updateCartQuantity,
  }
}
