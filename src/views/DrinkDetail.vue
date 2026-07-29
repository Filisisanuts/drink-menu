<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'

const route = useRoute()
const router = useRouter()

const drink = ref(Storage.getDrinkById(route.params.id))
const quantity = ref(1)
const addedToCart = ref(false)

const category = computed(() => {
  if (!drink.value) return null
  const categories = Storage.getCategories()
  return categories.find(c => c.id === drink.value.categoryId)
})

const addToCart = () => {
  Storage.addToCart(drink.value.id, quantity.value)
  addedToCart.value = true
  setTimeout(() => {
    addedToCart.value = false
  }, 2000)
}

const goToCart = () => {
  router.push('/cart')
}
</script>

<template>
  <div class="page drink-detail-page">
    <header class="page-header">
      <a class="back-btn" @click="router.back()">
        <Icon name="arrow-left" :size="18" />
        返回
      </a>
      <div style="width: 60px"></div>
    </header>

    <div v-if="drink" class="drink-content">
      <div class="drink-image-wrapper">
        <img v-if="drink.image" :src="drink.image" :alt="drink.name" class="drink-image" />
        <Icon v-else name="cocktail" :size="80" color="var(--text-light)" class="drink-image-placeholder" />
      </div>

      <div class="drink-info">
        <h1 class="drink-name">{{ drink.name }}</h1>

        <div v-if="category" class="drink-category">
          <span class="tag">{{ category.name }}</span>
        </div>

        <div v-if="drink.tags && drink.tags.length" class="drink-tags">
          <span v-for="tag in drink.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div v-if="drink.description" class="drink-description">
          <h3>详细介绍</h3>
          <p>{{ drink.description }}</p>
        </div>

        <div class="add-to-cart-section">
          <div class="quantity-selector">
            <button class="quantity-btn" @click="quantity = Math.max(1, quantity - 1)">
              <Icon name="minus" :size="16" />
            </button>
            <span class="quantity-value">{{ quantity }}</span>
            <button class="quantity-btn" @click="quantity++">
              <Icon name="plus" :size="16" />
            </button>
          </div>

          <button
            class="btn btn-primary btn-lg add-btn"
            :class="{ success: addedToCart }"
            @click="addToCart"
          >
            <Icon v-if="addedToCart" name="check" :size="18" color="white" />
            <span>{{ addedToCart ? '已加入' : '加入购物车' }}</span>
          </button>
        </div>

        <button v-if="addedToCart" class="btn btn-outline go-cart-btn" @click="goToCart">
          <Icon name="cart" :size="18" />
          查看购物车
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <Icon name="alert" :size="72" color="var(--text-light)" class="empty-state-icon" />
      <p class="empty-state-text">酒品不存在</p>
      <button class="btn btn-primary" @click="router.push('/')">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.drink-detail-page {
  padding-top: 0;
}

.drink-content {
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
  overflow: hidden;
  position: relative;
}

.drink-content::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  right: -4px;
  bottom: -4px;
  border: 1px solid var(--border);
  opacity: 0.5;
  z-index: -1;
}

.drink-image-wrapper {
  width: 100%;
  height: 280px;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid var(--border-ink);
}

.drink-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drink-image-placeholder {
  opacity: 0.4;
}

.drink-info {
  padding: 16px;
}

.drink-name {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 26px;
  font-weight: normal;
  margin-bottom: 12px;
  color: var(--ink);
  letter-spacing: 2px;
}

.drink-category {
  margin-bottom: 10px;
}

.drink-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.drink-description {
  margin-bottom: 20px;
  padding: 12px;
  background: var(--bg-input);
  border-left: 3px solid var(--primary);
}

.drink-description h3 {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  font-weight: normal;
  margin-bottom: 8px;
  color: var(--primary-dark);
}

.drink-description p {
  color: var(--text);
  line-height: 1.7;
  font-size: 14px;
}

.add-to-cart-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.add-btn {
  width: 100%;
}

.add-btn.success {
  background: var(--success);
  border-color: #4a8a4a;
}

.go-cart-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
