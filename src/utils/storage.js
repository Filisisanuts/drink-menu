const STORAGE_KEYS = {
  CATEGORIES: 'drink_menu_categories',
  DRINKS: 'drink_menu_drinks',
  ORDERS: 'drink_menu_orders',
  CART: 'drink_menu_cart',
  SETTINGS: 'drink_menu_settings'
}

// 默认分类
const DEFAULT_CATEGORIES = [
  { id: 'default', name: '全部酒品', icon: 'cocktail', sort: 0 }
]

// 默认设置
const DEFAULT_SETTINGS = {
  storeName: '清新小酒馆',
  welcomeMessage: '欢迎光临，品味美好时光'
}

class Storage {
  static get(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  static remove(key) {
    localStorage.removeItem(key)
  }

  static init() {
    if (!this.get(STORAGE_KEYS.CATEGORIES)) {
      this.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
    }
    if (!this.get(STORAGE_KEYS.DRINKS)) {
      this.set(STORAGE_KEYS.DRINKS, [])
    }
    if (!this.get(STORAGE_KEYS.ORDERS)) {
      this.set(STORAGE_KEYS.ORDERS, [])
    }
    if (!this.get(STORAGE_KEYS.CART)) {
      this.set(STORAGE_KEYS.CART, [])
    }
    if (!this.get(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    }
  }

  // 分类操作
  static getCategories() {
    return this.get(STORAGE_KEYS.CATEGORIES) || []
  }

  static addCategory(category) {
    const categories = this.getCategories()
    category.id = Date.now().toString()
    categories.push(category)
    this.set(STORAGE_KEYS.CATEGORIES, categories)
    return category
  }

  static updateCategory(id, updates) {
    const categories = this.getCategories()
    const index = categories.findIndex(c => c.id === id)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      this.set(STORAGE_KEYS.CATEGORIES, categories)
      return categories[index]
    }
    return null
  }

  static deleteCategory(id) {
    const categories = this.getCategories().filter(c => c.id !== id)
    this.set(STORAGE_KEYS.CATEGORIES, categories)
    // 同时删除该分类下的酒品
    const drinks = this.getDrinks().filter(d => d.categoryId !== id)
    this.set(STORAGE_KEYS.DRINKS, drinks)
  }

  // 酒品操作
  static getDrinks() {
    return this.get(STORAGE_KEYS.DRINKS) || []
  }

  static getDrinksByCategory(categoryId) {
    if (categoryId === 'default') return this.getDrinks()
    return this.getDrinks().filter(d => d.categoryId === categoryId)
  }

  static addDrink(drink) {
    const drinks = this.getDrinks()
    drink.id = Date.now().toString()
    drink.createdAt = new Date().toISOString()
    drinks.push(drink)
    this.set(STORAGE_KEYS.DRINKS, drinks)
    return drink
  }

  static updateDrink(id, updates) {
    const drinks = this.getDrinks()
    const index = drinks.findIndex(d => d.id === id)
    if (index !== -1) {
      drinks[index] = { ...drinks[index], ...updates }
      this.set(STORAGE_KEYS.DRINKS, drinks)
      return drinks[index]
    }
    return null
  }

  static deleteDrink(id) {
    const drinks = this.getDrinks().filter(d => d.id !== id)
    this.set(STORAGE_KEYS.DRINKS, drinks)
  }

  static getDrinkById(id) {
    return this.getDrinks().find(d => d.id === id) || null
  }

  // 购物车操作
  static getCart() {
    return this.get(STORAGE_KEYS.CART) || []
  }

  static addToCart(drinkId, quantity = 1) {
    const cart = this.getCart()
    const existing = cart.find(item => item.drinkId === drinkId)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ drinkId, quantity })
    }
    this.set(STORAGE_KEYS.CART, cart)
    return cart
  }

  static updateCartItem(drinkId, quantity) {
    const cart = this.getCart()
    const index = cart.findIndex(item => item.drinkId === drinkId)
    if (index !== -1) {
      if (quantity <= 0) {
        cart.splice(index, 1)
      } else {
        cart[index].quantity = quantity
      }
    }
    this.set(STORAGE_KEYS.CART, cart)
    return cart
  }

  static removeFromCart(drinkId) {
    const cart = this.getCart().filter(item => item.drinkId !== drinkId)
    this.set(STORAGE_KEYS.CART, cart)
    return cart
  }

  static clearCart() {
    this.set(STORAGE_KEYS.CART, [])
  }

  static getCartCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0)
  }

  // 订单操作
  static getOrders() {
    return this.get(STORAGE_KEYS.ORDERS) || []
  }

  static addOrder(cartItems) {
    const orders = this.getOrders()
    const drinks = this.getDrinks()
    const orderItems = cartItems.map(item => {
      const drink = drinks.find(d => d.id === item.drinkId)
      return {
        drinkId: item.drinkId,
        drinkName: drink?.name || '未知酒品',
        drinkImage: drink?.image || '',
        quantity: item.quantity
      }
    })
    const order = {
      id: Date.now().toString(),
      items: orderItems,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    orders.unshift(order)
    this.set(STORAGE_KEYS.ORDERS, orders)
    this.clearCart()
    return order
  }

  static updateOrderStatus(orderId, status) {
    const orders = this.getOrders()
    const order = orders.find(o => o.id === orderId)
    if (order) {
      order.status = status
      order.updatedAt = new Date().toISOString()
      this.set(STORAGE_KEYS.ORDERS, orders)
      return order
    }
    return null
  }

  // 设置操作
  static getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS
  }

  static updateSettings(updates) {
    const settings = this.getSettings()
    const newSettings = { ...settings, ...updates }
    this.set(STORAGE_KEYS.SETTINGS, newSettings)
    return newSettings
  }
}

export default Storage
