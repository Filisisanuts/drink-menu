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

    <div v-if="drinks.length > 0" class="drinks-staggered">
      <div
        v-for="(drink, index) in drinks"
        :key="drink.id"
        class="drink-card-staggered"
        :class="{ 'reverse': index % 2 !== 0 }"
      >
        <!-- 图片区域 -->
        <div class="drink-card-image-wrap" @click="openDrinkDetail(drink.id)">
          <div class="drink-card-frame">
            <img v-if="drink.image" :src="drink.image" :alt="drink.name" />
            <div v-else class="drink-card-placeholder">
              <Icon name="cocktail" :size="32" color="var(--text-light)" />
            </div>
          </div>
          <!-- 数量选择器 -->
          <div class="drink-card-qty" @click.stop>
            <template v-if="getCartQuantity(drink.id) === 0">
              <button class="qty-circle-btn" @click="addToCart(drink.id)">
                <Icon name="plus" :size="14" color="white" />
              </button>
            </template>
            <template v-else>
              <div class="qty-pill">
                <button class="qty-pill-btn" @click="removeFromCart(drink.id)">
                  <Icon name="minus" :size="12" />
                </button>
                <span class="qty-pill-num">{{ getCartQuantity(drink.id) }}</span>
                <button class="qty-pill-btn active" @click="addToCart(drink.id)">
                  <Icon name="plus" :size="12" color="white" />
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- 文字区域 -->
        <div class="drink-card-text" @click="openDrinkDetail(drink.id)">
          <h3 class="drink-card-name">{{ drink.name }}</h3>
          <p v-if="drink.tags && drink.tags.length" class="drink-card-tags">
            {{ drink.tags.join('/') }}
          </p>
          <p v-if="drink.description" class="drink-card-desc">{{ drink.description }}</p>
        </div>

        <!-- 装饰分割线 -->
        <div class="drink-card-divider"></div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Icon name="leaf" :size="72" color="var(--text-light)" class="empty-state-icon" />
      <p class="empty-text">该分类暂无酒品</p>
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
  padding: 0 16px 100px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px dashed var(--border);
  margin-bottom: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  cursor: pointer;
}

.page-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 24px;
  font-weight: normal;
  color: var(--ink);
}

/* 交错排列 */
.drinks-staggered {
  display: flex;
  flex-direction: column;
}

.drink-card-staggered {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  cursor: pointer;
  position: relative;
}

.drink-card-staggered.reverse {
  flex-direction: row-reverse;
}

/* 图片区域 */
.drink-card-image-wrap {
  position: relative;
  flex-shrink: 0;
  width: 120px;
}

.drink-card-frame {
  width: 120px;
  height: 120px;
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
  padding: 6px;
  position: relative;
}

.drink-card-frame::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  right: -4px;
  bottom: -4px;
  border: 1px dashed var(--border);
  z-index: -1;
}

.drink-card-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drink-card-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 数量选择器 */
.drink-card-qty {
  position: absolute;
  bottom: -8px;
  right: -8px;
}

.qty-circle-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--primary-dark);
  background: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.15);
  transition: all 0.15s;
}

.qty-circle-btn:hover {
  transform: scale(1.1);
}

.qty-pill {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 2px solid var(--primary-dark);
  border-radius: 14px;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.15);
}

.qty-pill-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-pill-btn:hover {
  background: var(--bg-input);
}

.qty-pill-btn.active {
  background: var(--primary);
}

.qty-pill-num {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 13px;
  min-width: 18px;
  text-align: center;
  color: var(--ink);
}

/* 文字区域 */
.drink-card-text {
  flex: 1;
  min-width: 0;
  padding: 4px 0;
}

.drink-card-name {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 22px;
  font-weight: normal;
  color: var(--ink);
  margin-bottom: 4px;
}

.drink-card-tags {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 12px;
  color: var(--primary);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.drink-card-desc {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 分割线 */
.drink-card-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: repeating-linear-gradient(
    90deg,
    var(--border-ink) 0px,
    var(--border-ink) 6px,
    transparent 6px,
    transparent 10px
  );
  opacity: 0.6;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-text {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 20px;
  color: var(--text-secondary);
  margin: 12px 0 20px;
}
</style>
