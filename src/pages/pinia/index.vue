<template>
  <view class="page">
    <image class="logo" src="/static/logo.png" mode="aspectFit" />
    <text class="title">{{ appName }}</text>
    <text class="subtitle">uni-app · 多端 · 前后端分离</text>

    <!-- 显示状态数据 -->
    <view class="card">
      <view class="card-item">
        <text class="label">当前计数 (State):</text>
        <text class="value highlight">{{ count }}</text>
      </view>
      <view class="card-item">
        <text class="label">双倍数值 (Getter):</text>
        <text class="value">{{ doubleCount }}</text>
      </view>
    </view>

    <!-- 操作方法 -->
    <view class="button-group">
      <button class="btn btn-primary" @tap="increment">增加 +1</button>
      <button class="btn btn-danger" @tap="decrement">减少 -1</button>
      <button class="btn btn-default" @tap="reset">重置数据</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { APP_NAME } from '@/config/env'
import { useCounterStore } from '@/stores/counter'
const appName = APP_NAME
// 1. 初始化 store 实例
const counterStore = useCounterStore()

// 2. 解构响应式属性 (State 和 Getters 必须使用 storeToRefs 解构，否则会失去响应式)
const { count, doubleCount } = storeToRefs(counterStore)

// 3. 解构方法 (Actions 本身是普通函数，可以直接解构使用)
const { increment, decrement, reset } = counterStore
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

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80rpx;
  margin-bottom: 50rpx;
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
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  margin-bottom: 60rpx;
}

.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.card-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666666;
}

.value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.highlight {
  color: #007aff;
}

.button-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn {
  width: 100%;
  font-size: 30rpx;
  border-radius: 40rpx;
}

.btn-primary {
  background-color: #007aff;
  color: #ffffff;
}

.btn-danger {
  background-color: #ff3b30;
  color: #ffffff;
}

.btn-default {
  background-color: #e5e5ea;
  color: #333333;
}
</style>
