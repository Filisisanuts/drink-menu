<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'
import DrinkDetailModal from '../components/DrinkDetailModal.vue'

const router = useRouter()
const categories = ref(Storage.getCategories())
const drinks = ref(Storage.getDrinks())
const settings = ref(Storage.getSettings())
const cartQuantities = ref({})
const selectedDrinkId = ref(null)

// 初始化购物车数量
const initCartQuantities = () => {
  const cart = Storage.getCart()
  cartQuantities.value = {}
  cart.forEach(item => {
    cartQuantities.value[item.drinkId] = item.quantity
  })
}
initCartQuantities()

window.addEventListener('cart-updated', initCartQuantities)

const featuredDrinks = computed(() => {
  return drinks.value.slice(0, 10)
})

const goToCategory = (categoryId) => {
  router.push(`/category/${categoryId}`)
}

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

const getCategoryIcon = (icon) => {
  const iconMap = {
    '🍸': 'cocktail', '🍷': 'wine', '🍺': 'beer', '🥂': 'wine',
    '🥃': 'wine', '🍾': 'bottle', '🍹': 'cocktail', '🫗': 'wine',
    '🍶': 'bottle', '🌿': 'leaf', '🍃': 'leaf', '🌸': 'leaf',
    '🍂': 'leaf', '🌙': 'star', '☀️': 'star'
  }
  return iconMap[icon] || 'cocktail'
}
</script>

<template>
  <div class="page home-page">
    <!-- 顶部标题 -->
    <header class="home-header">
      <div class="header-decoration left"></div>
      <h1 class="home-title">{{ settings.storeName }}</h1>
      <p class="home-subtitle">{{ settings.welcomeMessage }}</p>
      <div class="header-decoration right"></div>
    </header>

    <!-- 分类入口 -->
    <section class="categories-section">
      <div class="section-header">
        <span class="section-line"></span>
        <h2 class="section-title">酒品分类</h2>
        <span class="section-line"></span>
      </div>
      <div class="categories-scroll">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          @click="goToCategory(category.id)"
        >
          <Icon :name="getCategoryIcon(category.icon)" :size="20" color="var(--primary)" />
          <span>{{ category.name }}</span>
        </div>
      </div>
    </section>

    <!-- 酒品列表 - 交错排列 -->
    <section v-if="featuredDrinks.length > 0" class="drinks-section">
      <div class="section-header">
        <span class="section-line"></span>
        <h2 class="section-title">精选酒品</h2>
        <span class="section-line"></span>
      </div>

      <div class="drinks-staggered">
        <div
          v-for="(drink, index) in featuredDrinks"
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
    </section>

    <!-- 空状态 -->
    <section v-else class="empty-section">
      <div class="empty-illustration">
        <Icon name="cocktail" :size="64" color="var(--text-light)" />
      </div>
      <p class="empty-text">还没有酒品</p>
      <p class="empty-hint">去管理页面添加你的第一杯酒吧</p>
      <button class="btn btn-primary" @click="router.push('/admin')">
        前往管理
      </button>
    </section>

    <!-- 酒品详情弹窗 -->
    <DrinkDetailModal :drink-id="selectedDrinkId" @close="closeDrinkDetail" />
  </div>
</template>

<style scoped>
.home-page {
  padding: 0 16px 100px;
}

/* 顶部标题 */
.home-header {
  text-align: center;
  padding: 32px 16px 24px;
  position: relative;
}

.header-decoration {
  position: absolute;
  top: 50%;
  width: 40px;
  height: 1px;
  background: var(--border-ink);
}

.header-decoration.left { left: 20px; }
.header-decoration.right { right: 20px; }

.home-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 36px;
  font-weight: normal;
  color: var(--ink);
  letter-spacing: 8px;
  margin-bottom: 8px;
}

.home-subtitle {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 2px;
}

/* 分类区域 */
.categories-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-ink), transparent);
}

.section-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 20px;
  font-weight: normal;
  color: var(--ink);
  white-space: nowrap;
}

.categories-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-ink);
  border-radius: 2px;
  white-space: nowrap;
  cursor: pointer;
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 13px;
  color: var(--text);
  transition: all 0.15s;
}

.category-item:hover {
  background: var(--primary-bg);
  border-color: var(--primary);
}

/* 酒品列表 */
.drinks-section {
  margin-bottom: 24px;
}

.drinks-staggered {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 交错卡片 */
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

/* 空状态 */
.empty-section {
  text-align: center;
  padding: 60px 20px;
}

.empty-illustration {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 20px;
}
</style>
