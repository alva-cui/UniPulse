import { http } from '@/utils/request'

export interface HealthInfo {
  status: string
  time?: string
  service?: string
}

/** 探测接口：最终路径 = env.apiBaseUrl + '/hello'（H5 如 /dev-api/hello） */
export function fetchHealth() {
  return http.get<HealthInfo>('/hello', undefined, {
    auth: false,
    loading: false,
    showError: false
  })
}

