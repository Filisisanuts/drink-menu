<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'

const router = useRouter()

const cartItems = ref([])
const showConfirm = ref(false)

const loadCart = () => {
  const cart = Storage.getCart()
  const drinks = Storage.getDrinks()
  cartItems.value = cart.map(item => ({
    ...item,
    drink: drinks.find(d => d.id === item.drinkId)
  })).filter(item => item.drink)
}

loadCart()

const updateQuantity = (drinkId, quantity) => {
  Storage.updateCartItem(drinkId, quantity)
  loadCart()
}

const removeItem = (drinkId) => {
  Storage.removeFromCart(drinkId)
  loadCart()
}

const submitOrder = () => {
  if (cartItems.value.length === 0) return
  Storage.addOrder(cartItems.value.map(item => ({
    drinkId: item.drinkId,
    quantity: item.quantity
  })))
  showConfirm.value = true
  loadCart()
}

const goToOrders = () => {
  showConfirm.value = false
  router.push('/orders')
}

const goToHome = () => {
  showConfirm.value = false
  router.push('/')
}
</script>

<template>
  <div class="page cart-page">
    <header class="page-header">
      <h1 class="page-title">购物车</h1>
      <button
        v-if="cartItems.length > 0"
        class="btn btn-sm btn-secondary"
        @click="Storage.clearCart(); loadCart()"
      >
        清空
      </button>
    </header>

    <div v-if="cartItems.length > 0" class="cart-content">
      <div class="cart-list">
        <div v-for="item in cartItems" :key="item.drinkId" class="cart-item">
          <div class="cart-item-image">
            <img v-if="item.drink.image" :src="item.drink.image" :alt="item.drink.name" />
            <Icon v-else name="cocktail" :size="24" color="var(--text-light)" class="cart-item-placeholder" />
          </div>
          <div class="cart-item-info">
            <h3 class="cart-item-name">{{ item.drink.name }}</h3>
            <div class="cart-item-actions">
              <div class="quantity-selector">
                <button
                  class="quantity-btn"
                  @click="updateQuantity(item.drinkId, item.quantity - 1)"
                >
                  <Icon name="minus" :size="14" />
                </button>
                <span class="quantity-value">{{ item.quantity }}</span>
                <button
                  class="quantity-btn"
                  @click="updateQuantity(item.drinkId, item.quantity + 1)"
                >
                  <Icon name="plus" :size="14" />
                </button>
              </div>
              <button class="remove-btn" @click="removeItem(item.drinkId)">
                <Icon name="close" :size="14" color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="cart-total">
          <span>共 {{ cartItems.reduce((sum, item) => sum + item.quantity, 0) }} 件酒品</span>
        </div>
        <button class="btn btn-primary btn-lg" @click="submitOrder">
          提交订单
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <Icon name="shopping-bag" :size="72" color="var(--text-light)" class="empty-state-icon" />
      <p class="empty-state-text">购物车空空如也</p>
      <button class="btn btn-primary" @click="router.push('/')">去选酒</button>
    </div>

    <!-- 下单成功弹窗 -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="goToHome">
      <div class="modal confirm-dialog">
        <div class="modal-body">
          <Icon name="check" :size="56" color="var(--success)" class="confirm-dialog-icon" />
          <h2>下单成功！</h2>
          <p class="confirm-dialog-text">您的订单已提交，请稍候</p>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="goToHome">继续选酒</button>
            <button class="btn btn-primary" @click="goToOrders">查看订单</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  padding-top: 0;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
  position: relative;
}

.cart-item::before {
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

.cart-item-image {
  width: 56px;
  height: 56px;
  border: 1px solid var(--border-ink);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 15px;
  font-weight: normal;
  margin-bottom: 8px;
  color: var(--ink);
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-item-actions .quantity-selector {
  flex: 1;
}

.remove-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid #a93226;
  background: var(--error);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.remove-btn:hover {
  transform: scale(1.1);
}

.cart-summary {
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
  padding: 16px;
}

.cart-total {
  text-align: center;
  margin-bottom: 14px;
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 15px;
  color: var(--text-secondary);
}

.confirm-dialog {
  text-align: center;
}

.confirm-dialog-icon {
  margin: 0 auto 16px;
}

.confirm-dialog h2 {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 26px;
  font-weight: normal;
  margin-bottom: 8px;
  color: var(--ink);
}

.confirm-dialog-text {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-style: italic;
}

.confirm-dialog .modal-footer {
  border: none;
  padding: 0;
}
</style>
