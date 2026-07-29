import { supabase } from './supabase'
import Storage from './storage'

// Supabase 同步工具
export const SupabaseSync = {
  // 从 Supabase 加载数据到本地
  async loadFromCloud() {
    try {
      // 加载分类
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('sort', { ascending: true })

      // 加载酒品
      const { data: drinks } = await supabase
        .from('drinks')
        .select('*')
        .order('created_at', { ascending: false })

      // 加载订单
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      // 加载设置
      const { data: settingsData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'store')
        .single()

      // 转换数据格式并保存到本地
      if (categories && categories.length > 0) {
        const localCategories = categories.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          sort: c.sort || 0
        }))
        localStorage.setItem('drink_menu_categories', JSON.stringify(localCategories))
      }

      if (drinks && drinks.length > 0) {
        const localDrinks = drinks.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description || '',
          categoryId: d.category_id,
          tags: d.tags || [],
          image: d.image || '',
          featured: d.featured || false,
          createdAt: d.created_at
        }))
        localStorage.setItem('drink_menu_drinks', JSON.stringify(localDrinks))
      }

      if (orders && orders.length > 0) {
        const localOrders = orders.map(o => ({
          id: o.id,
          items: o.items || [],
          status: o.status,
          createdAt: o.created_at,
          updatedAt: o.updated_at
        }))
        localStorage.setItem('drink_menu_orders', JSON.stringify(localOrders))
      }

      if (settingsData?.value) {
        localStorage.setItem('drink_menu_settings', JSON.stringify(settingsData.value))
      }

      return { success: true, message: '数据加载成功' }
    } catch (err) {
      console.error('Load from cloud error:', err)
      return { success: false, message: err.message }
    }
  },

  // 从本地上传数据到 Supabase
  async syncToCloud() {
    try {
      // 同步分类
      const categories = Storage.getCategories()
      for (const cat of categories) {
        const { error } = await supabase
          .from('categories')
          .upsert({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || 'cocktail',
            sort: cat.sort || 0
          })
        if (error) throw error
      }

      // 同步酒品
      const drinks = Storage.getDrinks()
      for (const drink of drinks) {
        const { error } = await supabase
          .from('drinks')
          .upsert({
            id: drink.id,
            name: drink.name,
            description: drink.description || '',
            category_id: drink.categoryId,
            tags: drink.tags || [],
            image: drink.image || '',
            featured: drink.featured || false,
            created_at: drink.createdAt || new Date().toISOString()
          })
        if (error) throw error
      }

      // 同步订单
      const orders = Storage.getOrders()
      for (const order of orders) {
        const { error } = await supabase
          .from('orders')
          .upsert({
            id: order.id,
            items: order.items,
            status: order.status,
            created_at: order.createdAt,
            updated_at: order.updatedAt || new Date().toISOString()
          })
        if (error) throw error
      }

      // 同步设置
      const settings = Storage.getSettings()
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          key: 'store',
          value: settings
        })
      if (settingsError) throw settingsError

      return { success: true, message: '数据同步成功' }
    } catch (err) {
      console.error('Sync to cloud error:', err)
      return { success: false, message: err.message }
    }
  },

  // 清空云端数据
  async clearCloud() {
    try {
      await supabase.from('categories').delete().neq('id', '')
      await supabase.from('drinks').delete().neq('id', '')
      await supabase.from('orders').delete().neq('id', '')
      await supabase.from('settings').delete().neq('key', '')
      return { success: true, message: '云端数据已清空' }
    } catch (err) {
      console.error('Clear cloud error:', err)
      return { success: false, message: err.message }
    }
  }
}
