<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from './Icon.vue'

const router = useRouter()
const showPanel = ref(false)
const cartItems = ref([])
const cartCount = ref(0)

const loadCart = () => {
  const cart = Storage.getCart()
  const drinks = Storage.getDrinks()
  cartItems.value = cart.map(item => ({
    ...item,
    drink: drinks.find(d => d.id === item.drinkId)
  })).filter(item => item.drink)
  cartCount.value = Storage.getCartCount()
}

// 初始化加载
loadCart()

// 监听购物车更新事件
const handleCartUpdated = () => {
  loadCart()
}
onMounted(() => {
  window.addEventListener('cart-updated', handleCartUpdated)
  loadCart()
})
onUnmounted(() => {
  window.removeEventListener('cart-updated', handleCartUpdated)
})

const togglePanel = () => {
  showPanel.value = !showPanel.value
  if (showPanel.value) {
    loadCart()
  }
}

const closePanel = () => {
  showPanel.value = false
}

const updateQuantity = (drinkId, quantity) => {
  if (quantity <= 0) {
    Storage.removeFromCart(drinkId)
  } else {
    Storage.updateCartItem(drinkId, quantity)
  }
  loadCart()
}

const clearCart = () => {
  Storage.clearCart()
  loadCart()
}

const submitOrder = () => {
  if (cartItems.value.length === 0) return
  Storage.addOrder(cartItems.value.map(item => ({
    drinkId: item.drinkId,
    quantity: item.quantity
  })))
  showPanel.value = false
  loadCart()
  window.dispatchEvent(new Event('cart-updated'))
  router.push('/orders')
}

defineExpose({ loadCart })
</script>

<template>
  <!-- 悬浮购物车按钮 -->
  <div
    v-if="cartCount > 0"
    class="cart-fab"
    @click="togglePanel"
  >
    <Icon name="cart" :size="22" color="white" />
    <span class="cart-fab-badge">{{ cartCount }}</span>
  </div>

  <!-- 遮罩 -->
  <Transition name="fade">
    <div v-if="showPanel" class="cart-panel-overlay" @click="closePanel"></div>
  </Transition>

  <!-- 半屏面板 -->
  <Transition name="slide-up">
    <div v-if="showPanel" class="cart-panel">
      <div class="cart-panel-header">
        <div class="cart-panel-drag"></div>
        <div class="cart-panel-title-row">
          <h3 class="cart-panel-title">已选酒品</h3>
          <button class="cart-panel-clear" @click="clearCart">
            <Icon name="trash" :size="14" />
            清空
          </button>
        </div>
      </div>

      <div class="cart-panel-body">
        <div v-if="cartItems.length > 0" class="cart-panel-list">
          <div v-for="item in cartItems" :key="item.drinkId" class="cart-panel-item">
            <div class="cart-panel-item-image">
              <img v-if="item.drink.image" :src="item.drink.image" :alt="item.drink.name" />
              <Icon v-else name="cocktail" :size="20" color="var(--text-light)" />
            </div>
            <div class="cart-panel-item-info">
              <span class="cart-panel-item-name">{{ item.drink.name }}</span>
            </div>
            <div class="cart-panel-item-actions">
              <button class="qty-btn minus" @click="updateQuantity(item.drinkId, item.quantity - 1)">
                <Icon name="minus" :size="14" />
              </button>
              <span class="qty-value">{{ item.quantity }}</span>
              <button class="qty-btn plus" @click="updateQuantity(item.drinkId, item.quantity + 1)">
                <Icon name="plus" :size="14" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="cart-panel-empty">
          <Icon name="shopping-bag" :size="48" color="var(--text-light)" />
          <p>还没有选择酒品</p>
        </div>
      </div>

      <div class="cart-panel-footer">
        <div class="cart-panel-total">
          共 <span class="total-count">{{ cartCount }}</span> 件
        </div>
        <button class="cart-panel-submit" :disabled="cartItems.length === 0" @click="submitOrder">
          提交订单
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cart-fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary-dark);
  border: 2px solid var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1100;
  transition: all 0.15s;
}

.cart-fab:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--ink);
}

.cart-fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 2px;
  background: var(--error);
  border: 1px solid #a93226;
  color: white;
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1200;
}

.cart-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 55vh;
  background: var(--bg-paper);
  border-top: 3px solid var(--border-ink);
  z-index: 1300;
  display: flex;
  flex-direction: column;
}

.cart-panel-header {
  padding: 12px 16px 0;
}

.cart-panel-drag {
  width: 40px;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  margin: 0 auto 12px;
}

.cart-panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 2px dashed var(--border);
}

.cart-panel-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 20px;
  font-weight: normal;
  color: var(--ink);
}

.cart-panel-clear {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
}

.cart-panel-clear:hover {
  color: var(--error);
}

.cart-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  min-height: 80px;
}

.cart-panel-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-panel-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-ink);
}

.cart-panel-item-image {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-ink);
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.cart-panel-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-panel-item-info {
  flex: 1;
  min-width: 0;
}

.cart-panel-item-name {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 13px;
  color: var(--ink);
}

.cart-panel-item-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border-ink);
  background: var(--bg-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn.plus {
  background: var(--primary);
  border-color: var(--primary-dark);
  color: white;
}

.qty-value {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  min-width: 18px;
  text-align: center;
}

.cart-panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  color: var(--text-light);
}

.cart-panel-empty p {
  margin-top: 8px;
  font-size: 13px;
}

.cart-panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 2px solid var(--border-ink);
  background: var(--bg-card);
}

.cart-panel-total {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  color: var(--text-secondary);
}

.total-count {
  font-size: 18px;
  color: var(--primary-dark);
}

.cart-panel-submit {
  padding: 10px 24px;
  background: var(--primary);
  color: white;
  border: 2px solid var(--primary-dark);
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  cursor: pointer;
}

.cart-panel-submit:hover:not(:disabled) {
  background: var(--primary-dark);
}

.cart-panel-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
