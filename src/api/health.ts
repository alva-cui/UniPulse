import { http } from '@/utils/request'

export interface HealthInfo {
  status: string
  time?: string
  service?: string
}

/** 后端健康检查（需后端实现 GET /api/health） */
export function fetchHealth() {
  return http.get<HealthInfo>('/health', undefined, {
    auth: false,
    showError: false,
  })
}
