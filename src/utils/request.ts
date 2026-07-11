/**
 * 统一请求封装：对接独立后端，各端共用
 * 约定后端响应：{ code: number, message?: string, data?: T }
 */

import { env } from '@/config/env'

export interface ApiResult<T = unknown> {
  code: number
  message?: string
  data?: T
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: Record<string, unknown> | unknown
  header?: Record<string, string>
  /** 是否携带 token，默认 true */
  auth?: boolean
  /** 是否显示 loading，默认 true */
  loading?: boolean
  /** 失败是否 toast，默认 true */
  showError?: boolean
}

const TOKEN_KEY = 'access_token'

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

function buildUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  const path = url.startsWith('/') ? url : `/${url}`
  return `${env.apiBaseUrl}${path}`
}

// 维护全局 Loading 计数器，防止并发请求时 Loading 提前隐藏
let activeLoadingCount = 0

function showGlobalLoading() {
  if (activeLoadingCount === 0) {
    uni.showLoading({ title: '加载中', mask: true })
  }
  activeLoadingCount++
}

function hideGlobalLoading() {
  if (activeLoadingCount > 0) {
    activeLoadingCount--
  }
  if (activeLoadingCount === 0) {
    uni.hideLoading()
  }
}

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, auth = true, loading = true, showError = true } = options

  if (loading) {
    showGlobalLoading()
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header
  }

  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(url),
      method: method as any,
      data: data as UniApp.RequestOptions['data'],
      header: headers,
      timeout: env.timeout,
      success: res => {
        const status = res.statusCode || 0
        if (status < 200 || status >= 300) {
          const msg = `网络错误 (${status})`
          if (showError) {
            uni.showToast({ title: msg, icon: 'none' })
          }
          reject(new Error(msg))
          return
        }

        const body = res.data as ApiResult<T> | T

        // 标准业务包装处理
        if (body && typeof body === 'object' && 'code' in (body as object) && typeof (body as ApiResult).code === 'number') {
          const wrapped = body as ApiResult<T>
          if (wrapped.code === 0 || wrapped.code === 200) {
            resolve(wrapped.data as T)
            return
          }
          if (wrapped.code === 401) {
            clearToken()
            if (showError) {
              uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            }
            // 自动重定向至登录页面（可根据项目实际登录页路径调整）
            // setTimeout(() => {
            //   uni.reLaunch({ url: '/pages/login/index' })
            // }, 1000)

            reject(new Error(wrapped.message || '未授权'))
            return
          }
          const errMsg = wrapped.message || '请求失败'
          if (showError) {
            uni.showToast({ title: errMsg, icon: 'none' })
          }
          reject(new Error(errMsg))
          return
        }

        // 无包装，直接返回 body
        resolve(body as T)
      },
      fail: err => {
        const msg = err.errMsg || '网络异常'
        if (showError) {
          uni.showToast({ title: msg, icon: 'none' })
        }
        reject(new Error(msg))
      },
      complete: () => {
        if (loading) {
          hideGlobalLoading()
        }
      }
    })
  })
}

export const http = {
  // 使用解构确保 method 不会被传入的 opts 意外篡改
  get<T = unknown>(url: string, data?: Record<string, unknown>, opts?: Partial<RequestOptions>) {
    return request<T>({ ...opts, url, method: 'GET', data })
  },
  post<T = unknown>(url: string, data?: Record<string, unknown> | unknown, opts?: Partial<RequestOptions>) {
    return request<T>({ ...opts, url, method: 'POST', data })
  },
  put<T = unknown>(url: string, data?: Record<string, unknown> | unknown, opts?: Partial<RequestOptions>) {
    return request<T>({ ...opts, url, method: 'PUT', data })
  },
  delete<T = unknown>(url: string, data?: Record<string, unknown>, opts?: Partial<RequestOptions>) {
    return request<T>({ ...opts, url, method: 'DELETE', data })
  }
}
