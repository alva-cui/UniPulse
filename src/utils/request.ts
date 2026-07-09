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
  /** 是否显示 loading，默认 false */
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

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    auth = true,
    loading = false,
    showError = true,
  } = options

  if (loading) {
    uni.showLoading({ title: '加载中', mask: true })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
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
      method,
      data: data as UniApp.RequestOptions['data'],
      header: headers,
      timeout: env.timeout,
      success: (res) => {
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

        // 标准业务包装
        if (
          body &&
          typeof body === 'object' &&
          'code' in (body as object) &&
          typeof (body as ApiResult).code === 'number'
        ) {
          const wrapped = body as ApiResult<T>
          if (wrapped.code === 0 || wrapped.code === 200) {
            resolve(wrapped.data as T)
            return
          }
          if (wrapped.code === 401) {
            clearToken()
            if (showError) {
              uni.showToast({ title: '请重新登录', icon: 'none' })
            }
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
      fail: (err) => {
        const msg = err.errMsg || '网络异常'
        if (showError) {
          uni.showToast({ title: msg, icon: 'none' })
        }
        reject(new Error(msg))
      },
      complete: () => {
        if (loading) {
          uni.hideLoading()
        }
      },
    })
  })
}

export const http = {
  get<T = unknown>(url: string, data?: Record<string, unknown>, opts?: Partial<RequestOptions>) {
    return request<T>({ url, method: 'GET', data, ...opts })
  },
  post<T = unknown>(url: string, data?: Record<string, unknown>, opts?: Partial<RequestOptions>) {
    return request<T>({ url, method: 'POST', data, ...opts })
  },
  put<T = unknown>(url: string, data?: Record<string, unknown>, opts?: Partial<RequestOptions>) {
    return request<T>({ url, method: 'PUT', data, ...opts })
  },
  delete<T = unknown>(url: string, data?: Record<string, unknown>, opts?: Partial<RequestOptions>) {
    return request<T>({ url, method: 'DELETE', data, ...opts })
  },
}
