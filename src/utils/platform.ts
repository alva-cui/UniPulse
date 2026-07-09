/**
 * 运行端识别（编译期条件编译 + 运行时 uni.getSystemInfo）
 */

export type AppPlatform =
  | 'h5'
  | 'mp-weixin'
  | 'mp-alipay'
  | 'mp-toutiao'
  | 'mp-baidu'
  | 'mp-qq'
  | 'mp-kuaishou'
  | 'mp-jd'
  | 'mp-lark'
  | 'mp-xhs'
  | 'mp-harmony'
  | 'app'
  | 'app-android'
  | 'app-ios'
  | 'app-harmony'
  | 'unknown'

/** 编译期平台（构建时固定） */
export function getCompilePlatform(): AppPlatform {
  // #ifdef H5
  return 'h5'
  // #endif
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  // #ifdef MP-ALIPAY
  return 'mp-alipay'
  // #endif
  // #ifdef MP-TOUTIAO
  return 'mp-toutiao'
  // #endif
  // #ifdef MP-BAIDU
  return 'mp-baidu'
  // #endif
  // #ifdef MP-QQ
  return 'mp-qq'
  // #endif
  // #ifdef MP-KUAISHOU
  return 'mp-kuaishou'
  // #endif
  // #ifdef MP-JD
  return 'mp-jd'
  // #endif
  // #ifdef MP-LARK
  return 'mp-lark'
  // #endif
  // #ifdef MP-XHS
  return 'mp-xhs'
  // #endif
  // #ifdef MP-HARMONY
  return 'mp-harmony'
  // #endif
  // #ifdef APP-PLUS
  return 'app'
  // #endif
  // #ifdef APP-ANDROID
  return 'app-android'
  // #endif
  // #ifdef APP-IOS
  return 'app-ios'
  // #endif
  // #ifdef APP-HARMONY
  return 'app-harmony'
  // #endif
  return 'unknown'
}

/** 是否小程序端 */
export function isMiniProgram(): boolean {
  const p = getCompilePlatform()
  return p.startsWith('mp-')
}

/** 是否 App 端 */
export function isApp(): boolean {
  const p = getCompilePlatform()
  return p === 'app' || p.startsWith('app-')
}

/** 是否 H5 */
export function isH5(): boolean {
  return getCompilePlatform() === 'h5'
}

/** 运行时系统信息（异步场景用 sync 版本） */
export function getSystemInfo() {
  return uni.getSystemInfoSync()
}
