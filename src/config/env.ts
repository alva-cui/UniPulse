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

  // 非 H5 平台（小程序 / App）在开发环境下的配置
  if (import.meta.env.DEV) {
    /**
     * 【多端调试提示】：
     * 1. 微信小程序真机调试 / Android 真机调试：不能使用 localhost，必须改为你电脑的局域网 IP（如 192.168.x.x）
     * 2. Android 官方模拟器：电脑宿主机的 IP 映射为 10.0.2.2
     * 3. Genymotion 模拟器：电脑宿主机 IP 映射为 10.0.3.2
     */
    return 'http://localhost:3000/api' // 默认给出 Android 模拟器常用 IP，可根据实际开发设备微调
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
