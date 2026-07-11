import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_APP_PORT) || 9527
  // 仅 H5 使用部署子路径；小程序 / App 保持默认
  // UNI_PLATFORM 在部分启动时机可能为空，空时按 H5 处理
  const platform = process.env.UNI_PLATFORM || 'h5'
  const isH5 = platform === 'h5'
  const base = isH5 ? env.VITE_APP_CONTEXT_PATH || '/h5/' : './'
  // 代理路径前缀 → 真实后端（/dev-api/xxx → http://host/xxx）
  // 注意：rewrite 会剥掉 BASE_API；若后端本身挂在 /dev-api 下，请去掉 rewrite
  const baseApi = (env.VITE_APP_BASE_API || '/dev-api').replace(/\/$/, '') || '/dev-api'
  const proxyTarget = (env.VITE_APP_API_BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '')

  return {
    base,
    plugins: [uni()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      host: '0.0.0.0',
      port,
      hmr: {
        overlay: true
      },
      proxy: {
        [baseApi]: {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          rewrite: p => p.replace(new RegExp(`^${baseApi}`), '')
        }
      },
      warmup: {
        clientFiles: ['./src/main.ts', './src/App.vue']
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api']
        }
      }
    }
  }
})
