import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Storage from './utils/storage'
import './style.css'

// 初始化存储数据
Storage.init()

const app = createApp(App)
app.use(router)
app.mount('#app')
