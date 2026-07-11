<template>
  <view class="page">
    <image class="logo" src="@/static/logo.png" mode="aspectFit" />
    <text class="title">{{ appName }}</text>
    <text class="subtitle">uni-app · 多端</text>

    <view class="card">
      <view class="row">
        <text class="label">编译端</text>
        <text class="value">{{ platform }}</text>
      </view>
      <view class="row">
        <text class="label">系统</text>
        <text class="value">{{ systemLabel }}</text>
      </view>
      <view class="row">
        <text class="label">API</text>
        <text class="value mono">{{ apiBase }}</text>
      </view>
      <view class="row">
        <text class="label">后端</text>
        <text class="value" :class="healthOk ? 'ok' : 'bad'">{{ healthText }}</text>
      </view>
      <view class="row">
        <text class="label">Pinia</text>
        <text class="value" @click="toPinia">toPinia</text>
      </view>
      <view class="row">
        <text class="label">Chart</text>
        <text class="value" @click="toChart">toChart</text>
      </view>
    </view>

    <button class="btn" type="primary" :loading="loading" @click="checkHealth">探测后端 /hello</button>

    <view class="tips">
      <text class="tip-title">常用命令</text>
      <text class="tip">H5：npm run dev:h5</text>
      <text class="tip">微信：npm run dev:mp-weixin</text>
      <text class="tip">支付宝：npm run dev:mp-alipay</text>
      <text class="tip">抖音：npm run dev:mp-toutiao</text>
      <text class="tip">App 资源：npm run dev:app</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { APP_NAME, env } from '@/config/env'
import { getCompilePlatform, getSystemInfo } from '@/utils/platform'
import { fetchHealth } from '@/api/health'

const appName = APP_NAME
const platform = ref(getCompilePlatform())
const systemLabel = ref('')
const apiBase = env.apiBaseUrl
const loading = ref(false)
const healthOk = ref(false)
const healthText = ref('未探测')

function toPinia() {
  uni.navigateTo({ url: '/pages/pinia/index' })
}

function toChart() {
  uni.navigateTo({ url: '/pages/chart/index' })
}

onMounted(() => {
  try {
    const info = getSystemInfo()
    systemLabel.value = `${info.platform || '-'} / ${info.system || '-'}`
  } catch {
    systemLabel.value = '-'
  }
})

async function checkHealth() {
  loading.value = true
  healthText.value = '请求中…'
  try {
    const data = await fetchHealth()
    healthText.value = data?.status ? `${data.status}${data.service ? ` · ${data.service}` : ''}` : 'ok'
    healthOk.value = true
  } catch (e) {
    healthOk.value = false
    healthText.value = e instanceof Error ? e.message : '不可达'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 40rpx 80rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f0f4ff 0%, #f7f8fa 40%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-top: 48rpx;
}

.title {
  margin-top: 24rpx;
  font-size: 44rpx;
  font-weight: 600;
  color: #1a1a2e;
}

.subtitle {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.card {
  width: 100%;
  margin-top: 48rpx;
  padding: 28rpx 32rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(26, 26, 46, 0.06);
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f3;
}

.row:last-child {
  border-bottom: none;
}

.label {
  flex-shrink: 0;
  font-size: 26rpx;
  color: #9ca3af;
}

.value {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #111827;
  word-break: break-all;
}

.value.mono {
  font-size: 22rpx;
  color: #4b5563;
}

.value.ok {
  color: #059669;
}

.value.bad {
  color: #dc2626;
}

.btn {
  width: 100%;
  margin-top: 40rpx;
  border-radius: 16rpx;
}

.tips {
  width: 100%;
  margin-top: 48rpx;
  padding: 24rpx 28rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.tip-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8rpx;
}

.tip {
  font-size: 22rpx;
  color: #6b7280;
  font-family: ui-monospace, monospace;
}
</style>
