<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Storage from '../utils/storage'
import Icon from '../components/Icon.vue'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const categories = ref(Storage.getCategories())

const form = ref({
  name: '',
  description: '',
  categoryId: categories.value[0]?.id || '',
  tags: [],
  image: ''
})

const tagInput = ref('')
const imagePreview = ref(null)

onMounted(() => {
  if (isEdit.value) {
    const drink = Storage.getDrinkById(route.params.id)
    if (drink) {
      form.value = {
        name: drink.name,
        description: drink.description || '',
        categoryId: drink.categoryId || '',
        tags: drink.tags || [],
        image: drink.image || ''
      }
      if (drink.image) {
        imagePreview.value = drink.image
      }
    }
  }
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.image = e.target.result
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  form.value.image = ''
  imagePreview.value = null
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

const removeTag = (tag) => {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

const handleSubmit = () => {
  if (!form.value.name.trim()) {
    alert('请输入酒品名称')
    return
  }

  if (isEdit.value) {
    Storage.updateDrink(route.params.id, form.value)
  } else {
    Storage.addDrink(form.value)
  }

  router.push('/admin/drinks')
}
</script>

<template>
  <div class="page drink-form-page">
    <header class="page-header">
      <a class="back-btn" @click="router.back()">
        <Icon name="arrow-left" :size="18" />
        返回
      </a>
      <h1 class="page-title">{{ isEdit ? '编辑酒品' : '添加酒品' }}</h1>
      <div style="width: 60px"></div>
    </header>

    <form class="form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">酒品图片</label>
        <div v-if="imagePreview" class="upload-preview">
          <img :src="imagePreview" alt="预览" />
          <button type="button" class="upload-preview-remove" @click="removeImage">
            <Icon name="close" :size="12" color="white" />
          </button>
        </div>
        <label v-else class="upload-area">
          <input type="file" accept="image/*" @change="handleImageUpload" hidden />
          <Icon name="camera" :size="40" color="var(--text-light)" class="upload-area-icon" />
          <span class="upload-area-text">点击上传图片</span>
        </label>
      </div>

      <div class="form-group">
        <label class="form-label">酒品名称 *</label>
        <input
          v-model="form.name"
          type="text"
          class="input"
          placeholder="请输入酒品名称"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">所属分类</label>
        <select v-model="form.categoryId" class="input">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">酒品介绍</label>
        <textarea
          v-model="form.description"
          class="input textarea"
          placeholder="请输入酒品介绍"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">标签</label>
        <div class="tags-input">
          <div class="tags-list">
            <span v-for="tag in form.tags" :key="tag" class="tag">
              {{ tag }}
              <button type="button" class="tag-remove" @click="removeTag(tag)">
                <Icon name="close" :size="10" />
              </button>
            </span>
          </div>
          <div class="tag-input-row">
            <input
              v-model="tagInput"
              type="text"
              class="input"
              placeholder="输入标签后按回车"
              @keyup.enter.prevent="addTag"
            />
            <button type="button" class="btn btn-sm btn-secondary" @click="addTag">添加</button>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="router.back()">取消</button>
        <button type="submit" class="btn btn-primary">
          {{ isEdit ? '保存修改' : '添加酒品' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.drink-form-page {
  padding-top: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'ZCOOL KuaiLe', cursive;
  font-size: 14px;
  color: var(--ink);
}

select.input {
  cursor: pointer;
}

.upload-preview {
  position: relative;
  width: 120px;
}

.upload-preview img {
  width: 100%;
  border: 2px solid var(--border-ink);
  display: block;
}

.upload-preview-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--error);
  border: 1px solid #a93226;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tags-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-remove {
  background: none;
  border: none;
  color: var(--primary-dark);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.tag-input-row {
  display: flex;
  gap: 8px;
}

.tag-input-row .input {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
  border-top: 2px dashed var(--border);
}

.form-actions .btn {
  flex: 1;
}
</style>
