<script setup>
import { ref, computed, watch } from 'vue'
import Storage from '../utils/storage'
import Icon from './Icon.vue'

const props = defineProps({
  drinkId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

const drink = ref(null)
const quantity = ref(1)
const cartQuantity = ref(0)

const category = computed(() => {
  if (!drink.value) return null
  const categories = Storage.getCategories()
  return categories.find(c => c.id === drink.value.categoryId)
})

watch(() => props.drinkId, (newId) => {
  if (newId) {
    drink.value = Storage.getDrinkById(newId)
    quantity.value = 1
    loadCartQuantity()
  }
}, { immediate: true })

const loadCartQuantity = () => {
  if (!drink.value) return
  const cart = Storage.getCart()
  const item = cart.find(c => c.drinkId === drink.value.id)
  cartQuantity.value = item ? item.quantity : 0
}

const close = () => {
  emit('close')
}

const addToCart = () => {
  if (!drink.value) return
  Storage.addToCart(drink.value.id, quantity.value)
  loadCartQuantity()
  window.dispatchEvent(new Event('cart-updated'))
  close()
}
</script>

<template>
  <div v-if="drinkId && drink" class="modal-overlay" @click.self="close">
    <div class="drink-modal">
      <!-- 关闭按钮 -->
      <button class="modal-close" @click="close">
        <Icon name="close" :size="18" />
      </button>

      <!-- 图片区域 -->
      <div class="modal-image-area">
        <div class="modal-image-frame">
          <img v-if="drink.image" :src="drink.image" :alt="drink.name" />
          <div v-else class="modal-image-placeholder">
            <Icon name="cocktail" :size="48" color="var(--text-light)" />
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="modal-content">
        <h2 class="modal-name">{{ drink.name }}</h2>

        <div class="modal-meta">
          <span v-if="category" class="modal-category">{{ category.name }}</span>
          <span v-if="drink.tags && drink.tags.length" class="modal-tags">
            {{ drink.tags.join(' / ') }}
          </span>
        </div>

        <div v-if="drink.description" class="modal-desc">
          <p>{{ drink.description }}</p>
        </div>

        <div v-if="cartQuantity > 0" class="modal-cart-info">
          已选 {{ cartQuantity }} 件
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="modal-footer">
        <div class="modal-qty">
          <button class="qty-btn" @click="quantity = Math.max(1, quantity - 1)">
            <Icon name="minus" :size="14" />
          </button>
          <span class="qty-num">{{ quantity }}</span>
          <button class="qty-btn" @click="quantity++">
            <Icon name="plus" :size="14" />
          </button>
        </div>
        <button class="modal-add-btn" @click="addToCart">
          加入购物车
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 44, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(3px);
}

.drink-modal {
  background: var(--bg-paper);
  border: 2px solid var(--border-ink);
  width: 100%;
  max-width: 340px;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.15);
  animation: modal-in 0.25s ease;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-ink);
  background: var(--bg-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.15s;
}

.modal-close:hover {
  background: #fde8e8;
}

/* 图片区域 */
.modal-image-area {
  padding: 20px 20px 12px;
  display: flex;
  justify-content: center;
}

.modal-image-frame {
  width: 160px;
  height: 160px;
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
  padding: 8px;
  position: relative;
}

.modal-image-frame::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: -5px;
  bottom: -5px;
  border: 1px dashed var(--border);
  z-index: -1;
}

.modal-image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-image-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 内容区域 */
.modal-content {
  padding: 0 20px 16px;
  text-align: center;
}

.modal-name {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 26px;
  font-weight: normal;
  color: var(--ink);
  margin-bottom: 8px;
}

.modal-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.modal-category {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 12px;
  padding: 3px 10px;
  border: 1px solid var(--primary);
  color: var(--primary-dark);
  background: var(--primary-bg);
}

.modal-tags {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 3px 10px;
  border: 1px solid var(--border);
}

.modal-desc {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 12px;
}

.modal-cart-info {
  display: inline-block;
  padding: 6px 14px;
  background: var(--primary-bg);
  border: 1px solid var(--primary);
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 13px;
  color: var(--primary-dark);
}

/* 底部操作 */
.modal-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-top: 1px dashed var(--border);
}

.modal-qty {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--border-ink);
  background: var(--bg-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.qty-btn:hover {
  background: var(--bg-input);
}

.qty-num {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 18px;
  min-width: 24px;
  text-align: center;
  color: var(--ink);
}

.modal-add-btn {
  flex: 1;
  padding: 10px 16px;
  background: var(--primary);
  color: white;
  border: 2px solid var(--primary-dark);
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.modal-add-btn:hover {
  background: var(--primary-dark);
}
</style>
