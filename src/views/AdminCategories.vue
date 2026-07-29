<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'

const router = useRouter()
const categories = ref(Storage.getCategories())

const showModal = ref(false)
const editingCategory = ref(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const form = ref({
  name: '',
  icon: 'cocktail'
})

// SVG 图标选项
const iconOptions = [
  { name: 'cocktail', label: '鸡尾酒' },
  { name: 'wine', label: '红酒' },
  { name: 'beer', label: '啤酒' },
  { name: 'bottle', label: '酒瓶' },
  { name: 'leaf', label: '植物' },
  { name: 'star', label: '推荐' }
]

const getIconName = (icon) => {
  const found = iconOptions.find(i => i.name === icon)
  return found ? found.label : icon
}

const openAddModal = () => {
  editingCategory.value = null
  form.value = { name: '', icon: 'cocktail' }
  showModal.value = true
}

const openEditModal = (category) => {
  editingCategory.value = category
  form.value = { name: category.name, icon: category.icon }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
  form.value = { name: '', icon: 'cocktail' }
}

const saveCategory = () => {
  if (!form.value.name.trim()) {
    alert('请输入分类名称')
    return
  }

  if (editingCategory.value) {
    Storage.updateCategory(editingCategory.value.id, form.value)
  } else {
    Storage.addCategory(form.value)
  }

  categories.value = Storage.getCategories()
  closeModal()
}

const confirmDelete = (category) => {
  deleteTarget.value = category
  showDeleteConfirm.value = true
}

const deleteCategory = () => {
  if (deleteTarget.value) {
    Storage.deleteCategory(deleteTarget.value.id)
    categories.value = Storage.getCategories()
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
  <div class="page admin-categories-page">
    <header class="page-header">
      <a class="back-btn" @click="router.push('/admin')">
        <Icon name="arrow-left" :size="18" />
        返回
      </a>
      <h1 class="page-title">分类管理</h1>
      <button class="btn btn-sm btn-primary" @click="openAddModal">
        <Icon name="plus" :size="14" />
        添加
      </button>
    </header>

    <div v-if="categories.length > 0" class="categories-list">
      <div v-for="category in categories" :key="category.id" class="category-item">
        <Icon :name="category.icon || 'cocktail'" :size="24" color="var(--primary)" class="category-item-icon" />
        <span class="category-item-name">{{ category.name }}</span>
        <div class="category-item-actions">
          <button class="action-btn edit" @click="openEditModal(category)">
            <Icon name="edit" :size="16" color="var(--primary)" />
          </button>
          <button class="action-btn delete" @click="confirmDelete(category)">
            <Icon name="trash" :size="16" color="var(--error)" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <Icon name="leaf" :size="72" color="var(--text-light)" class="empty-state-icon" />
      <p class="empty-state-text">还没有分类</p>
      <button class="btn btn-primary" @click="openAddModal">添加第一个分类</button>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingCategory ? '编辑分类' : '添加分类' }}</h3>
          <button class="modal-close" @click="closeModal">
            <Icon name="close" :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">分类图标</label>
            <div class="icon-picker">
              <button
                v-for="icon in iconOptions"
                :key="icon.name"
                type="button"
                class="icon-option"
                :class="{ active: form.icon === icon.name }"
                @click="form.icon = icon.name"
                :title="icon.label"
              >
                <Icon :name="icon.name" :size="22" color="var(--text)" />
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">分类名称</label>
            <input
              v-model="form.name"
              type="text"
              class="input"
              placeholder="请输入分类名称"
              @keyup.enter="saveCategory"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveCategory">保存</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal confirm-dialog">
        <div class="modal-body">
          <Icon name="alert" :size="48" color="var(--warning)" class="confirm-dialog-icon" />
          <h2>确认删除</h2>
          <p class="confirm-dialog-text">
            确定要删除分类「{{ deleteTarget?.name }}」吗？<br />
            该分类下的所有酒品也会被删除。
          </p>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="cancelDelete">取消</button>
            <button class="btn btn-danger" @click="deleteCategory">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-categories-page {
  padding-top: 0;
}

.categories-list {
  background: var(--bg-card);
  border: 2px solid var(--border-ink);
  overflow: hidden;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
}

.category-item:not(:last-child) {
  border-bottom: 1px dashed var(--border);
}

.category-item-name {
  flex: 1;
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 15px;
  color: var(--ink);
}

.category-item-actions {
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

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--ink);
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-option {
  width: 48px;
  height: 48px;
  border: 2px solid var(--border-ink);
  border-radius: var(--radius);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-option:hover {
  border-color: var(--primary);
  background: var(--primary-bg);
}

.icon-option.active {
  border-color: var(--primary-dark);
  background: var(--primary-bg);
  box-shadow: 2px 2px 0 var(--primary);
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
  line-height: 1.6;
}

.confirm-dialog .modal-footer {
  border: none;
  padding: 0;
}
</style>
