<template>
  <!-- 容器绑定唯一 ID，用于动态测量尺寸 -->
  <view :id="'container-' + canvasId" class="chart-container" :style="{ width: width, height: height }">
    <!-- 1. 微信小程序平台：使用 Canvas 2D 提升高清屏表现 -->
    <!-- #ifdef MP-WEIXIN -->
    <canvas type="2d" :id="canvasId" class="chart-canvas" @touchstart="onTouch" @touchmove="onTouchMove" @touchend="onTouchEnd" />
    <!-- #endif -->

    <!-- 2. H5、Android/iOS App 及其他平台：使用标准 Canvas，固定 pixelRatio: 1 保证极佳稳定性 -->
    <!-- #ifndef MP-WEIXIN -->
    <canvas :canvas-id="canvasId" :id="canvasId" class="chart-canvas" @touchstart="onTouch" @touchmove="onTouchMove" @touchend="onTouchEnd" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, watch, nextTick, onBeforeUnmount } from 'vue'
import uCharts from '@qiun/ucharts'

// 定义标准的图表数据格式
interface ChartSeries {
  name?: string
  data: number | number[] | any[]
  [key: string]: any
}

interface ChartData {
  categories?: string[]
  series: ChartSeries[]
}

// 接收外部传入的图表配置
interface Props {
  canvasId: string
  type: 'line' | 'column' | 'mount' | 'area' | 'ring' | 'pie' | 'arc' | 'gauge' | 'radar'
  chartData: ChartData
  opts?: Record<string, any>
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '350rpx',
  opts: () => ({})
})

const instance = getCurrentInstance()
let uChartsInstance: any = null

// 处理图表点击（如显示 Tooltip 信息）
const onTouch = (e: any) => {
  if (uChartsInstance) {
    uChartsInstance.showToolTip(e, {
      format: (item: any, category: any) => {
        return (category ? category + ' ' : '') + item.name + ': ' + item.data
      }
    })
  }
}

// 支持图表横向拖拽滚动
const onTouchMove = (e: any) => {
  if (uChartsInstance && props.opts?.enableScroll) {
    uChartsInstance.scroll(e)
  }
}

const onTouchEnd = (e: any) => {
  if (uChartsInstance && props.opts?.enableScroll) {
    uChartsInstance.scrollEnd(e)
  }
}

// 初始化图表核心逻辑
const initChart = () => {
  if (!instance) return

  // 使用 SelectorQuery 动态读取容器的物理高宽，自适应各种弹性布局
  const query = uni.createSelectorQuery().in(instance)
  query
    .select(`#container-${props.canvasId}`)
    .boundingClientRect((rect: any) => {
      if (!rect) return
      const width = rect.width
      const height = rect.height

      // #ifdef MP-WEIXIN
      // 微信小程序平台：依然支持 Canvas 2D 高清缩放
      const dpr = uni.getSystemInfoSync().pixelRatio || 1
      const canvasQuery = uni.createSelectorQuery().in(instance)
      canvasQuery
        .select(`#${props.canvasId}`)
        .fields({ node: true, size: true }, (res: any) => {
          if (!res || !res.node) {
            fallbackInit(width, height)
            return
          }
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')

          canvas.width = width * dpr
          canvas.height = height * dpr
          ctx.scale(dpr, dpr)

          uChartsInstance = new uCharts({
            type: props.type,
            context: ctx,
            canvas2d: true,
            pixelRatio: dpr,
            width: width,
            height: height,
            ...getCommonConfig()
          })
        })
        .exec()
      // #endif

      // #ifndef MP-WEIXIN
      // H5、Android/iOS App 等平台：一律采用最稳定的标准 1:1 模式初始化
      fallbackInit(width, height)
      // #endif
    })
    .exec()
}

// 传统 Canvas 初始化
const fallbackInit = (width: number, height: number) => {
  const ctx = uni.createCanvasContext(props.canvasId, instance)
  uChartsInstance = new uCharts({
    type: props.type,
    context: ctx,
    pixelRatio: 1, // 👈 强制固定为 1，确保字体与比例在各种 Android/H5 屏幕下大小完全正常
    width: width,
    height: height,
    ...getCommonConfig()
  })
}

// 提取通用默认配置
const getCommonConfig = () => {
  const defaultExtra = {
    pie: {
      activeOpacity: 0.5,
      activeRadius: 10,
      offsetAngle: 0,
      labelWidth: 15
    },
    ring: {
      ringWidth: 30,
      activeOpacity: 0.5,
      activeRadius: 10,
      offsetAngle: 0,
      labelWidth: 15
    },
    rose: {
      type: 'area',
      activeOpacity: 0.5,
      activeRadius: 10,
      offsetAngle: 0,
      labelWidth: 15
    },
    column: {
      type: 'group',
      width: 20,
      activeBgColor: '#000000',
      activeBgOpacity: 0.08
    }
  }

  const userExtra = props.opts?.extra || {}
  const mergedExtra = {
    pie: { ...defaultExtra.pie, ...userExtra.pie },
    ring: { ...defaultExtra.ring, ...userExtra.ring },
    rose: { ...defaultExtra.rose, ...userExtra.rose },
    column: { ...defaultExtra.column, ...userExtra.column },
    ...userExtra
  }

  return {
    categories: props.chartData.categories || [],
    series: formatSeries(props.type, props.chartData.series || []),
    animation: true,
    background: '#FFFFFF',
    color: ['#1890FF', '#91CB74', '#FAC858', '#EE6666', '#73C0DE', '#3CA272', '#FC8452'],
    padding: [15, 15, 0, 15],
    legend: { show: true },
    xAxis: { disableGrid: true },
    yAxis: { gridType: 'dash', dashLength: 2 },
    ...props.opts,
    extra: mergedExtra
  }
}

// 智能转换 ECharts 风格数据
const formatSeries = (type: string, series: any[]) => {
  if (!series || series.length === 0) return []

  if (['pie', 'ring', 'rose'].includes(type)) {
    if (series.length === 1 && Array.isArray(series[0].data)) {
      return series[0].data.map((item: any) => ({
        name: item.name,
        data: typeof item.value === 'number' ? item.value : item.data
      }))
    }
  }
  return series
}

// 监听数据源变动
watch(
  () => props.chartData,
  newVal => {
    if (uChartsInstance) {
      uChartsInstance.updateData({
        categories: newVal.categories || [],
        series: formatSeries(props.type, newVal.series || []),
        scrollPosition: 'left'
      })
    } else {
      initChart()
    }
  },
  { deep: true }
)

// 监听配置选项发生变化
watch(
  () => [props.opts, props.type],
  () => {
    nextTick(() => {
      initChart()
    })
  },
  { deep: true }
)

onMounted(() => {
  // 延时 100ms 首次获取正确的页面尺寸进行初始化
  setTimeout(() => {
    initChart()
  }, 100)
})

onBeforeUnmount(() => {
  if (uChartsInstance) {
    uChartsInstance = null
  }
})
</script>

<style scoped>
.chart-container {
  display: block;
  position: relative;
  box-sizing: border-box;
}
.chart-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
