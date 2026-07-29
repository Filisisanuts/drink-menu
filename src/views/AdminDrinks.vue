<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'

const router = useRouter()
const drinks = ref(Storage.getDrinks())
const categories = Storage.getCategories()

const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const getCategoryName = (categoryId) => {
  const cat = categories.find(c => c.id === categoryId)
  return cat ? cat.name : '未分类'
}

const editDrink = (id) => {
  router.push(`/admin/drinks/edit/${id}`)
}

const confirmDelete = (drink) => {
  deleteTarget.value = drink
  showDeleteConfirm.value = true
}

const deleteDrink = () => {
  if (deleteTarget.value) {
    Storage.deleteDrink(deleteTarget.value.id)
    drinks.value = Storage.getDrinks()
    showDeleteConfirm.value = false
    deleteTarget.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

const toggleFeatured = (drink) => {
  const updated = { ...drink, featured: !drink.featured }
  Storage.updateDrink(drink.id, updated)
  drinks.value = Storage.getDrinks()
}
</script>

<template>
  <div class="page admin-drinks-page">
    <header class="page-header">
      <a class="back-btn" @click="router.push('/admin')">
        <Icon name="arrow-left" :size="18" />
        返回
      </a>
      <h1 class="page-title">酒品管理</h1>
      <button class="btn btn-sm btn-primary" @click="router.push('/admin/drinks/add')">
        <Icon name="plus" :size="14" />
        添加
      </button>
    </header>

    <div v-if="drinks.length > 0" class="drinks-list">
      <div v-for="drink in drinks" :key="drink.id" class="drink-item">
        <div class="drink-item-image">
          <img v-if="drink.image" :src="drink.image" :alt="drink.name" />
          <Icon v-else name="cocktail" :size="24" color="var(--text-light)" class="drink-item-placeholder" />
        </div>
        <div class="drink-item-content">
          <h3 class="drink-item-name">
            {{ drink.name }}
            <Icon v-if="drink.featured" name="star" :size="14" color="var(--accent-dark)" class="featured-icon" />
          </h3>
          <span class="drink-item-category">{{ getCategoryName(drink.categoryId) }}</span>
        </div>
        <div class="drink-item-actions">
          <button
            class="action-btn"
            :class="{ 'featured': drink.featured }"
            @click.stop="toggleFeatured(drink)"
            :title="drink.featured ? '取消推荐' : '设为推荐'"
          >
            <Icon name="star" :size="16" :color="drink.featured ? 'var(--accent-dark)' : 'var(--text-light)'" />
          </button>
          <button class="action-btn edit" @click="editDrink(drink.id)">
            <Icon name="edit" :size="16" color="var(--primary)" />
          </button>
          <button class="action-btn delete" @click="confirmDelete(drink)">
            <Icon name="trash" :size="16" color="var(--error)" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Icon name="cocktail" :size="72" color="var(--text-light)" class="empty-state-icon" />
      <p class="empty-state-text">还没有酒品</p>
      <button class="btn btn-primary" @click="router.push('/admin/drinks/add')">
        添加第一个酒品
      </button>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal confirm-dialog">
        <div class="modal-body">
          <Icon name="alert" :size="48" color="var(--warning)" class="confirm-dialog-icon" />
          <h2>确认删除</h2>
          <p class="confirm-dialog-text">确定要删除「{{ deleteTarget?.name }}」吗？</p>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="cancelDelete">取消</button>
            <button class="btn btn-danger" @click="deleteDrink">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-drinks-page {
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

.drink-item-image {
  width: 56px;
  height: 56px;
  border: 1px solid var(--border-ink);
  overflow: hidden;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

.drink-item-category {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}

.drink-item-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-ink);
  border-radius: 50%;
  background: var(--bg-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.action-btn:hover {
  transform: scale(1.1);
  background: var(--bg-input);
}

.action-btn.featured {
  background: var(--accent);
  border-color: var(--accent-dark);
}

.featured-icon {
  margin-left: 4px;
  vertical-align: middle;
}

.btn-danger {
  background: var(--error);
  color: white;
  border-color: #a93226;
}

.btn-danger:hover {
  background: #a93226;
}

.confirm-dialog {
  text-align: center;
}

.confirm-dialog-icon {
  margin: 0 auto 12px;
}

.confirm-dialog h2 {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 24px;
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
