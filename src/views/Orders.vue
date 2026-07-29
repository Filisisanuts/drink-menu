<script setup>
import { ref } from 'vue'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'

const orders = ref(Storage.getOrders())
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const statusMap = {
  pending: { label: '待确认', class: 'status-pending' },
  confirmed: { label: '已确认', class: 'status-confirmed' },
  making: { label: '制作中', class: 'status-making' },
  completed: { label: '已完成', class: 'status-completed' },
  cancelled: { label: '已取消', class: 'status-cancelled' }
}

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

const confirmDelete = (order) => {
  deleteTarget.value = order
  showDeleteConfirm.value = true
}

const deleteOrder = () => {
  if (deleteTarget.value) {
    const allOrders = Storage.getOrders()
    const newOrders = allOrders.filter(o => o.id !== deleteTarget.value.id)
    localStorage.setItem('drink_menu_orders', JSON.stringify(newOrders))
    orders.value = newOrders
    showDeleteConfirm.value = false
    deleteTarget.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteTarget.value = null
}
</script>

<template>
  <div class="page orders-page">
    <header class="page-header">
      <h1 class="page-title">我的订单</h1>
    </header>

    <div v-if="orders.length > 0" class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-id">订单 #{{ order.id.slice(-6) }}</span>
          <div class="order-header-right">
            <span class="status" :class="statusMap[order.status]?.class">
              {{ statusMap[order.status]?.label }}
            </span>
            <button class="delete-btn" @click.stop="confirmDelete(order)">
              <Icon name="trash" :size="14" />
            </button>
          </div>
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
      </div>
    </div>

    <div v-else class="empty-state">
      <Icon name="order" :size="72" color="var(--text-light)" class="empty-state-icon" />
      <p class="empty-state-text">还没有订单记录</p>
      <button class="btn btn-primary" @click="$router.push('/')">去选酒</button>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal confirm-dialog">
        <div class="modal-body">
          <Icon name="alert" :size="48" color="var(--warning)" class="confirm-icon" />
          <h2 class="confirm-title">确认删除</h2>
          <p class="confirm-text">
            确定要删除订单 #{{ deleteTarget?.id?.slice(-6) }} 吗？
          </p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" @click="cancelDelete">取消</button>
            <button class="btn btn-danger" @click="deleteOrder">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
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

.order-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--error);
  background: transparent;
  color: var(--error);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.delete-btn:hover {
  background: var(--error);
  color: white;
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

/* 删除确认弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal {
  background: var(--bg-paper);
  border: 2px solid var(--border-ink);
  width: 100%;
  max-width: 300px;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.15);
}

.confirm-dialog {
  text-align: center;
}

.modal-body {
  padding: 24px 20px;
}

.confirm-icon {
  margin-bottom: 12px;
}

.confirm-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 22px;
  font-weight: normal;
  color: var(--ink);
  margin-bottom: 8px;
}

.confirm-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.confirm-actions .btn {
  flex: 1;
  padding: 10px 16px;
}

.btn-secondary {
  background: var(--bg-input);
  border: 1px solid var(--border-ink);
  color: var(--text);
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--border-light);
}

.btn-danger {
  background: var(--error);
  border: 1px solid #a93226;
  color: white;
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #a93226;
}
</style>
