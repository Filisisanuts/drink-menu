<script setup>
import { ref } from 'vue'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'
import { SupabaseSync } from '../utils/supabaseSync'

const emit = defineEmits(['close'])

const importFile = ref(null)
const importPreview = ref(null)
const showImportConfirm = ref(false)
const importData = ref(null)
const syncStatus = ref('')
const isSyncing = ref(false)

// 导出数据
const exportData = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    categories: Storage.getCategories(),
    drinks: Storage.getDrinks(),
    orders: Storage.getOrders(),
    settings: Storage.getSettings()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `酒馆数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 选择导入文件
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.name.endsWith('.json')) {
    alert('请选择 JSON 文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (!data.categories || !data.drinks) {
        alert('无效的数据格式')
        return
      }
      importData.value = data
      importPreview.value = {
        categories: data.categories.length,
        drinks: data.drinks.length,
        orders: data.orders?.length || 0,
        date: data.exportDate ? new Date(data.exportDate).toLocaleString('zh-CN') : '未知'
      }
      showImportConfirm.value = true
    } catch (err) {
      alert('文件解析失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
}

// 确认导入
const confirmImport = () => {
  if (!importData.value) return

  if (importData.value.categories) {
    localStorage.setItem('drink_menu_categories', JSON.stringify(importData.value.categories))
  }
  if (importData.value.drinks) {
    localStorage.setItem('drink_menu_drinks', JSON.stringify(importData.value.drinks))
  }
  if (importData.value.orders) {
    localStorage.setItem('drink_menu_orders', JSON.stringify(importData.value.orders))
  }
  if (importData.value.settings) {
    localStorage.setItem('drink_menu_settings', JSON.stringify(importData.value.settings))
  }

  alert('导入成功！页面将刷新')
  window.location.reload()
}

// 清空所有数据
const clearAllData = () => {
  if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    localStorage.removeItem('drink_menu_categories')
    localStorage.removeItem('drink_menu_drinks')
    localStorage.removeItem('drink_menu_orders')
    localStorage.removeItem('drink_menu_cart')
    localStorage.removeItem('drink_menu_settings')
    alert('数据已清空，页面将刷新')
    window.location.reload()
  }
}

// 从云端加载
const loadFromCloud = async () => {
  if (!confirm('从云端加载将覆盖本地数据，确定继续吗？')) return

  isSyncing.value = true
  syncStatus.value = '正在从云端加载...'

  const result = await SupabaseSync.loadFromCloud()
  isSyncing.value = false

  if (result.success) {
    syncStatus.value = '加载成功！页面将刷新'
    setTimeout(() => window.location.reload(), 1500)
  } else {
    syncStatus.value = `加载失败：${result.message}`
  }
}

// 同步到云端
const syncToCloud = async () => {
  isSyncing.value = true
  syncStatus.value = '正在同步到云端...'

  const result = await SupabaseSync.syncToCloud()
  isSyncing.value = false

  if (result.success) {
    syncStatus.value = '同步成功！'
  } else {
    syncStatus.value = `同步失败：${result.message}`
  }
}

// 清空云端
const clearCloud = async () => {
  if (!confirm('确定要清空云端数据吗？此操作不可恢复！')) return

  isSyncing.value = true
  syncStatus.value = '正在清空云端...'

  const result = await SupabaseSync.clearCloud()
  isSyncing.value = false

  syncStatus.value = result.success ? '云端数据已清空' : `清空失败：${result.message}`
}

const close = () => {
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="close">
    <div class="data-modal">
      <div class="modal-header">
        <h3 class="modal-title">数据管理</h3>
        <button class="modal-close" @click="close">
          <Icon name="close" :size="18" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Supabase 云同步 -->
        <div class="data-section cloud-section">
          <div class="section-icon cloud">
            <Icon name="settings" :size="24" color="white" />
          </div>
          <div class="section-content">
            <h4>云端同步</h4>
            <p>与 Supabase 云端数据库同步</p>
            <div class="cloud-btns">
              <button class="btn btn-primary" @click="loadFromCloud" :disabled="isSyncing">
                <Icon name="order" :size="14" />
                从云端加载
              </button>
              <button class="btn btn-primary" @click="syncToCloud" :disabled="isSyncing">
                <Icon name="plus" :size="14" />
                同步到云端
              </button>
              <button class="btn btn-danger" @click="clearCloud" :disabled="isSyncing">
                <Icon name="trash" :size="14" />
                清空云端
              </button>
            </div>
            <p v-if="syncStatus" class="sync-status">{{ syncStatus }}</p>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- 导出 -->
        <div class="data-section">
          <div class="section-icon">
            <Icon name="order" :size="24" color="var(--primary)" />
          </div>
          <div class="section-content">
            <h4>导出数据</h4>
            <p>将所有数据导出为 JSON 文件</p>
            <button class="btn btn-primary" @click="exportData">
              <Icon name="order" :size="16" />
              导出数据
            </button>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- 导入 -->
        <div class="data-section">
          <div class="section-icon">
            <Icon name="plus" :size="24" color="var(--primary)" />
          </div>
          <div class="section-content">
            <h4>导入数据</h4>
            <p>从 JSON 文件导入数据（将覆盖当前数据）</p>
            <label class="btn btn-outline">
              <Icon name="order" :size="16" />
              选择文件
              <input type="file" accept=".json" @change="handleFileSelect" hidden />
            </label>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- 清空 -->
        <div class="data-section danger">
          <div class="section-icon">
            <Icon name="trash" :size="24" color="var(--error)" />
          </div>
          <div class="section-content">
            <h4>清空本地数据</h4>
            <p>删除所有本地数据（不可恢复）</p>
            <button class="btn btn-danger" @click="clearAllData">
              <Icon name="trash" :size="16" />
              清空数据
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入确认弹窗 -->
    <div v-if="showImportConfirm" class="confirm-overlay" @click.self="showImportConfirm = false">
      <div class="confirm-modal">
        <Icon name="alert" :size="48" color="var(--warning)" />
        <h3>确认导入</h3>
        <div class="import-preview" v-if="importPreview">
          <p>导入时间：{{ importPreview.date }}</p>
          <p>分类数量：{{ importPreview.categories }} 个</p>
          <p>酒品数量：{{ importPreview.drinks }} 个</p>
          <p>订单数量：{{ importPreview.orders }} 个</p>
        </div>
        <p class="confirm-warn">导入将覆盖当前所有数据，确定继续吗？</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" @click="showImportConfirm = false">取消</button>
          <button class="btn btn-primary" @click="confirmImport">确认导入</button>
        </div>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.data-modal {
  background: var(--bg-paper);
  border: 2px solid var(--border-ink);
  width: 100%;
  max-width: 380px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 2px dashed var(--border);
}

.modal-title {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 22px;
  font-weight: normal;
  color: var(--ink);
}

.modal-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-ink);
  background: var(--bg-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 16px;
}

.data-section {
  display: flex;
  gap: 14px;
  padding: 14px 0;
}

.cloud-section {
  background: var(--primary-bg);
  margin: -16px -16px 16px;
  padding: 16px;
  border-bottom: 2px dashed var(--border);
}

.section-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-ink);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon.cloud {
  background: var(--primary);
  border-color: var(--primary-dark);
}

.section-content {
  flex: 1;
}

.section-content h4 {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 15px;
  color: var(--ink);
  margin-bottom: 4px;
}

.section-content p {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.cloud-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sync-status {
  margin-top: 8px;
  padding: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--primary-dark);
}

.section-divider {
  height: 1px;
  background: repeating-linear-gradient(
    90deg,
    var(--border) 0px,
    var(--border) 6px,
    transparent 6px,
    transparent 10px
  );
}

.data-section.danger {
  opacity: 0.9;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-ink);
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 12px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary-dark);
}

.btn-outline {
  background: transparent;
  color: var(--primary);
}

.btn-danger {
  background: var(--error);
  color: white;
  border-color: #a93226;
}

.btn-secondary {
  background: var(--bg-input);
  color: var(--text);
}

/* 确认弹窗 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.confirm-modal {
  background: var(--bg-paper);
  border: 2px solid var(--border-ink);
  padding: 24px;
  width: 100%;
  max-width: 320px;
  text-align: center;
}

.confirm-modal h3 {
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 22px;
  margin: 12px 0;
  color: var(--ink);
}

.import-preview {
  text-align: left;
  padding: 12px;
  background: var(--bg-input);
  margin: 12px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.import-preview p {
  margin: 4px 0;
}

.confirm-warn {
  font-size: 13px;
  color: var(--error);
  margin-bottom: 16px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.confirm-actions .btn {
  flex: 1;
  justify-content: center;
}
</style>
