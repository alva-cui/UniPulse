import { http } from '@/utils/request'

export interface HealthInfo {
  status: string
  time?: string
  service?: string
}

/** 后端健康检查（需后端实现 GET /api/health） */
export function fetchHealth() {
  return http.get<HealthInfo>(
    '/health', // 接口地址
    undefined, // 参数
    {
      auth: false, // 是否携带 token
      loading: false, // 是否显示 loading
      showError: false // 失败是否 toast
    }
  )
}
