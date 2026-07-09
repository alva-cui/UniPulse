import { createSSRApp } from 'vue'
import App from './App.vue'
// Pinia
import * as Pinia from 'pinia'
// 持久化插件
import { createPersistedState } from 'pinia-plugin-persistedstate'
export function createApp() {
  const app = createSSRApp(App)
  const pinia = Pinia.createPinia()

  // 配置持久化插件
  pinia.use(
    createPersistedState({
      storage: {
        getItem: key => uni.getStorageSync(key),
        setItem: (key, value) => uni.setStorageSync(key, value)
      }
    })
  )

  app.use(pinia)

  return {
    app,
    Pinia
  }
}
