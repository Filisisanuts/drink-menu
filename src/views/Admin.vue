<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'

const router = useRouter()
const settings = Storage.getSettings()
const drinks = Storage.getDrinks()
const categories = Storage.getCategories()
const orders = Storage.getOrders()
const pendingOrders = orders.filter(o => o.status === 'pending')
</script>

<template>
  <div class="page admin-page">
    <header class="admin-header">
      <h1 class="page-title">管理</h1>
      <p class="admin-welcome">{{ settings.storeName }}</p>
    </header>

    <div class="admin-stats">
      <div class="stat-card">
        <Icon name="cocktail" :size="20" color="var(--primary)" class="stat-icon" />
        <span class="stat-value">{{ drinks.length }}</span>
        <span class="stat-label">酒品</span>
      </div>
      <div class="stat-card">
        <Icon name="leaf" :size="20" color="var(--primary)" class="stat-icon" />
        <span class="stat-value">{{ categories.length }}</span>
        <span class="stat-label">分类</span>
      </div>
      <div class="stat-card">
        <Icon name="order" :size="20" color="var(--primary)" class="stat-icon" />
        <span class="stat-value">{{ orders.length }}</span>
        <span class="stat-label">订单</span>
      </div>
      <div class="stat-card">
        <Icon name="alert" :size="20" color="var(--warning)" class="stat-icon" />
        <span class="stat-value">{{ pendingOrders.length }}</span>
        <span class="stat-label">待处理</span>
      </div>
    </div>

    <div class="admin-menu">
      <div class="menu-item" @click="router.push('/admin/drinks')">
        <Icon name="cocktail" :size="20" color="var(--primary)" class="menu-icon" />
        <div class="menu-content">
          <span class="menu-title">酒品管理</span>
          <span class="menu-desc">添加、编辑、删除酒品</span>
        </div>
        <Icon name="arrow-right" :size="16" color="var(--text-light)" />
      </div>

      <div class="menu-item" @click="router.push('/admin/categories')">
        <Icon name="leaf" :size="20" color="var(--primary)" class="menu-icon" />
        <div class="menu-content">
          <span class="menu-title">分类管理</span>
          <span class="menu-desc">管理酒品分类</span>
        </div>
        <Icon name="arrow-right" :size="16" color="var(--text-light)" />
      </div>

      <div class="menu-item" @click="router.push('/admin/orders')">
        <Icon name="order" :size="20" color="var(--primary)" class="menu-icon" />
        <div class="menu-content">
          <span class="menu-title">订单管理</span>
          <span class="menu-desc">查看和处理订单</span>
        </div>
        <span v-if="pendingOrders.length > 0" class="menu-badge">{{ pendingOrders.length }}</span>
        <Icon name="arrow-right" :size="16" color="var(--text-light)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 0 16px 100px;
}

.admin-header {
  text-align: center;
  padding: 24px 0 16px;
}

.admin-welcome {
  color: var(--text-secondary);
  margin-top: 4px;
  font-size: 13px;
  font-style: italic;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-ink);
}

.stat-icon {
  margin-bottom: 4px;
}

.stat-value {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 24px;
  color: var(--primary-dark);
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.admin-menu {
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.menu-item:not(:last-child) {
  border-bottom: 1px dashed var(--border);
}

.menu-item:hover {
  background: var(--bg-input);
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  color: var(--ink);
  display: block;
}

.menu-desc {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}

.menu-badge {
  background: var(--error);
  border: 1px solid #a93226;
  color: white;
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 11px;
  padding: 2px 6px;
  margin-right: 8px;
}
</style>
