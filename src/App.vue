<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Storage from './utils/storage'
import Icon from './components/Icon.vue'
import CartFloat from './components/CartFloat.vue'

const route = useRoute()
const cartFloatRef = ref(null)

const showBottomNav = computed(() => {
  const hiddenRoutes = ['AdminDrinks', 'AdminCategories', 'AdminOrders', 'AddDrink', 'EditDrink']
  return !hiddenRoutes.includes(route.name)
})

// 悬浮购物车只在首页显示
const showCartFloat = computed(() => {
  return route.name === 'Home' || route.name === 'Category'
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- 悬浮购物车 - 只在首页和分类页显示 -->
  <CartFloat v-if="showCartFloat" ref="cartFloatRef" />

  <nav v-if="showBottomNav" class="bottom-nav">
    <router-link to="/" class="nav-item" :class="{ active: route.name === 'Home' }">
      <Icon name="home" :size="22" class="nav-item-icon" />
      <span>首页</span>
    </router-link>
    <router-link to="/orders" class="nav-item" :class="{ active: route.name === 'Orders' }">
      <Icon name="order" :size="22" class="nav-item-icon" />
      <span>订单</span>
    </router-link>
    <router-link to="/admin" class="nav-item" :class="{ active: route.name === 'Admin' }">
      <Icon name="settings" :size="22" class="nav-item-icon" />
      <span>管理</span>
    </router-link>
  </nav>
</template>
