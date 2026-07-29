<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'
import DrinkDetailModal from '../components/DrinkDetailModal.vue'

const route = useRoute()
const router = useRouter()

const category = ref(null)
const drinks = ref([])
const cartQuantities = ref({})
const selectedDrinkId = ref(null)

const loadCategory = () => {
  const categories = Storage.getCategories()
  category.value = categories.find(c => c.id === route.params.id)
  drinks.value = Storage.getDrinksByCategory(route.params.id)
  initCartQuantities()
}

const initCartQuantities = () => {
  const cart = Storage.getCart()
  cartQuantities.value = {}
  cart.forEach(item => {
    cartQuantities.value[item.drinkId] = item.quantity
  })
}

loadCategory()

watch(() => route.params.id, loadCategory)

// 监听购物车更新
window.addEventListener('cart-updated', initCartQuantities)

const openDrinkDetail = (drinkId) => {
  selectedDrinkId.value = drinkId
}

const closeDrinkDetail = () => {
  selectedDrinkId.value = null
  initCartQuantities()
}

const getCartQuantity = (drinkId) => {
  return cartQuantities.value[drinkId] || 0
}

const addToCart = (drinkId) => {
  Storage.addToCart(drinkId, 1)
  cartQuantities.value[drinkId] = (cartQuantities.value[drinkId] || 0) + 1
  window.dispatchEvent(new Event('cart-updated'))
}

const removeFromCart = (drinkId) => {
  const current = cartQuantities.value[drinkId] || 0
  if (current <= 1) {
    Storage.removeFromCart(drinkId)
    delete cartQuantities.value[drinkId]
  } else {
    Storage.updateCartItem(drinkId, current - 1)
    cartQuantities.value[drinkId] = current - 1
  }
  window.dispatchEvent(new Event('cart-updated'))
}
</script>

<template>
  <div class="page category-page">
    <header class="page-header">
      <a class="back-btn" @click="router.back()">
        <Icon name="arrow-left" :size="18" />
        返回
      </a>
      <h1 class="page-title">{{ category?.name || '分类' }}</h1>
      <div style="width: 60px"></div>
    </header>

    <div v-if="drinks.length > 0" class="drinks-list">
      <div
        v-for="drink in drinks"
        :key="drink.id"
        class="drink-item"
        @click="openDrinkDetail(drink.id)"
      >
        <div class="drink-item-image">
          <img v-if="drink.image" :src="drink.image" :alt="drink.name" />
          <Icon v-else name="cocktail" :size="28" color="var(--text-light)" class="drink-item-placeholder" />
        </div>
        <div class="drink-item-content">
          <h3 class="drink-item-name">{{ drink.name }}</h3>
          <p class="drink-item-desc">{{ drink.description || '暂无介绍' }}</p>
          <div v-if="drink.tags && drink.tags.length" class="drink-item-tags">
            <span v-for="tag in drink.tags.slice(0, 2)" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 数量选择器 -->
        <div class="drink-item-qty" @click.stop>
          <template v-if="getCartQuantity(drink.id) === 0">
            <button class="qty-add-btn" @click="addToCart(drink.id)">
              <Icon name="plus" :size="16" color="white" />
            </button>
          </template>
          <template v-else>
            <div class="qty-bar">
              <button class="qty-bar-btn minus" @click="removeFromCart(drink.id)">
                <Icon name="minus" :size="12" />
              </button>
              <span class="qty-bar-value">{{ getCartQuantity(drink.id) }}</span>
              <button class="qty-bar-btn plus" @click="addToCart(drink.id)">
                <Icon name="plus" :size="12" color="white" />
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Icon name="leaf" :size="72" color="var(--text-light)" class="empty-state-icon" />
      <p class="empty-state-text">该分类暂无酒品</p>
      <button class="btn btn-primary" @click="router.push('/admin/drinks/add')">
        添加酒品
      </button>
    </div>

    <!-- 酒品详情弹窗 -->
    <DrinkDetailModal :drink-id="selectedDrinkId" @close="closeDrinkDetail" />
  </div>
</template>

<style scoped>
.category-page {
  padding-top: 0;
}

.drinks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drink-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.drink-item::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  right: -3px;
  bottom: -3px;
  border: 1px solid var(--border);
  opacity: 0.5;
  z-index: -1;
}

.drink-item:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--border);
}

.drink-item-image {
  width: 70px;
  height: 70px;
  border: 1px solid var(--border-ink);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
}

.drink-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drink-item-content {
  flex: 1;
  min-width: 0;
}

.drink-item-name {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 15px;
  font-weight: normal;
  margin-bottom: 4px;
  color: var(--ink);
}

.drink-item-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
}

.drink-item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.drink-item-tags .tag {
  font-size: 10px;
  padding: 2px 6px;
}

/* 数量选择器 */
.drink-item-qty {
  flex-shrink: 0;
}

.qty-add-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--primary-dark);
  background: var(--primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
}

.qty-add-btn:hover {
  transform: scale(1.1);
  background: var(--primary-dark);
}

.qty-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-card);
  border: 2px solid var(--primary-dark);
  border-radius: 20px;
  padding: 2px;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
}

.qty-bar-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: var(--bg-input);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.qty-bar-btn:hover {
  background: var(--border);
}

.qty-bar-btn.plus {
  background: var(--primary);
  color: white;
}

.qty-bar-btn.plus:hover {
  background: var(--primary-dark);
}

.qty-bar-value {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  min-width: 20px;
  text-align: center;
  color: var(--ink);
}
</style>
