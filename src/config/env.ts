/**
 * 环境与 API 基址配置（前后端分离）
 * 开发/生产通过 Vite 环境变量切换，各端可覆盖
 */

const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || ''

/** 按端给默认 API 地址，本地开发可改这里或用 .env */
function resolveDefaultBase(): string {
  // #ifdef H5
  // H5 开发建议走 Vite 代理，避免跨域
  if (import.meta.env.DEV) {
    return '/api'
  }
  // #endif

  // 小程序 / App 需写完整域名（真机/模拟器不能用 localhost 时请换成局域网 IP 或线上域名）
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:3000/api'
  }

  return envBase 
}

export const APP_NAME = 'APP应用'

export const env = {
  /** 是否开发环境 */
  isDev: import.meta.env.DEV,
  /** 当前模式 development | production */
  mode: import.meta.env.MODE,
  /** 后端 API 前缀，末尾不要带 / */
  apiBaseUrl: (envBase || resolveDefaultBase()).replace(/\/$/, ''),
  /** 请求超时 ms */
  timeout: 15000
}
