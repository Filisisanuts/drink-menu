import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === 'production' ? '/drink-menu/' : '/',
  build: {
    // 压缩图片数据
    chunkSizeWarningLimit: 1000,
  }
}))
