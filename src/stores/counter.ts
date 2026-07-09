import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore(
  'counter',
  () => {
    // ---- 1. State (状态) ----
    const count = ref<number>(0)

    // ---- 2. Getters (计算属性) ----
    const doubleCount = computed(() => count.value * 2)

    // ---- 3. Actions (修改状态的方法) ----
    function increment() {
      count.value++
    }

    function decrement() {
      if (count.value > 0) {
        count.value--
      }
    }

    function reset() {
      count.value = 0
    }

    // 必须将所有状态和方法导出
    return {
      count,
      doubleCount,
      increment,
      decrement,
      reset
    }
  },
  {
    // 开启持久化（如果不使用第一步的持久化插件，可以把这个配置去掉）
    persist: true
  }
)
