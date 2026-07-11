/**
 * 环境配置（前后端分离、多端共用）
 *
 * 变量说明（见 .env.development / .env.production）：
 * - VITE_APP_TITLE         应用标题
 * - VITE_APP_API_BASE_URL  真实后端，如 http://127.0.0.1:8080
 * - VITE_APP_BASE_API      H5 前缀，如 /dev-api、/prod-api
 * - VITE_APP_ENV           环境标识 development | production
 *
 * API 基址规则：
 * - H5：用 BASE_API（开发代理 / 生产 Nginx）
 * - 小程序 / App：用 API_BASE_URL（真机勿用 localhost，改局域网 IP）
 */

function trimSlash(url: string): string {
  return url.replace(/\/$/, '')
}

function read(key: keyof ImportMetaEnv): string {
  const v = import.meta.env[key]
  return typeof v === 'string' ? v.trim() : ''
}

/** 请求基址：H5 相对前缀，其它端完整后端地址 */
function resolveApiBaseUrl(): string {
  let base = ''

  // #ifdef H5
  base = read('VITE_APP_BASE_API') || '/dev-api'
  // #endif

  // #ifndef H5
  base = read('VITE_APP_API_BASE_URL')
  // #endif

  base = trimSlash(base)

  // #ifndef H5
  if (!base) {
    console.warn('[env] 未配置 VITE_APP_API_BASE_URL，小程序/App 请求将失败。请在 .env 中填写后端地址')
  }
  // #endif

  return base
}

export const APP_NAME = read('VITE_APP_TITLE') || 'APP'

export const env = {
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  /** 业务环境标识 */
  appEnv: read('VITE_APP_ENV') || import.meta.env.MODE,
  /** 请求基址，末尾无 / */
  apiBaseUrl: resolveApiBaseUrl(),
  /** 真实后端地址（代理目标；非 H5 时与 apiBaseUrl 相同） */
  apiServer: trimSlash(read('VITE_APP_API_BASE_URL')),
  timeout: 15000
}
