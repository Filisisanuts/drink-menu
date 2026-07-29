<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'

const router = useRouter()
const orders = ref(Storage.getOrders())

const statusOptions = [
  { value: 'pending', label: '待确认', class: 'status-pending' },
  { value: 'confirmed', label: '已确认', class: 'status-confirmed' },
  { value: 'making', label: '制作中', class: 'status-making' },
  { value: 'completed', label: '已完成', class: 'status-completed' },
  { value: 'cancelled', label: '已取消', class: 'status-cancelled' }
]

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTotalQuantity = (items) => {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

const getStatusInfo = (status) => {
  return statusOptions.find(s => s.value === status) || statusOptions[0]
}

const updateStatus = (orderId, newStatus) => {
  Storage.updateOrderStatus(orderId, newStatus)
  orders.value = Storage.getOrders()
}
</script>

<template>
  <div class="page admin-orders-page">
    <header class="page-header">
      <a class="back-btn" @click="router.push('/admin')">
        <Icon name="arrow-left" :size="18" />
        返回
      </a>
      <h1 class="page-title">订单管理</h1>
      <div style="width: 60px"></div>
    </header>

    <div v-if="orders.length > 0" class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-id">订单 #{{ order.id.slice(-6) }}</span>
          <span class="status" :class="getStatusInfo(order.status).class">
            {{ getStatusInfo(order.status).label }}
          </span>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.drinkId" class="order-item">
            <div class="order-item-image">
              <img v-if="item.drinkImage" :src="item.drinkImage" :alt="item.drinkName" />
              <Icon v-else name="cocktail" :size="20" color="var(--text-light)" class="order-item-placeholder" />
            </div>
            <div class="order-item-info">
              <span class="order-item-name">{{ item.drinkName }}</span>
              <span class="order-item-qty">× {{ item.quantity }}</span>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          <span class="order-total">共 {{ getTotalQuantity(order.items) }} 件</span>
        </div>

        <div class="order-actions">
          <label class="action-label">更新状态：</label>
          <select
            :value="order.status"
            class="status-select"
            @change="updateStatus(order.id, $event.target.value)"
          >
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Icon name="order" :size="72" color="var(--text-light)" class="empty-state-icon" />
      <p class="empty-state-text">还没有订单</p>
      <button class="btn btn-primary" @click="router.push('/')">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.admin-orders-page {
  padding-top: 0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-card {
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
  overflow: hidden;
  position: relative;
}

.order-card::before {
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

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg-input);
  border-bottom: 2px dashed var(--border);
}

.order-id {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 13px;
  color: var(--ink);
}

.order-items {
  padding: 12px 14px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.order-item:not(:last-child) {
  border-bottom: 1px dashed var(--border-light);
}

.order-item-image {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-ink);
  overflow: hidden;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.order-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-item-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-item-name {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  color: var(--ink);
}

.order-item-qty {
  color: var(--text-secondary);
  font-size: 13px;
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg-input);
  border-top: 2px dashed var(--border);
  font-size: 12px;
  color: var(--text-secondary);
}

.order-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px dashed var(--border);
}

.action-label {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 13px;
  color: var(--text-secondary);
}

.status-select {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid var(--border-ink);
  border-radius: var(--radius);
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 13px;
  background: var(--bg-card);
  cursor: pointer;
}

.status-select:focus {
  outline: none;
  border-color: var(--primary);
}
</style>
