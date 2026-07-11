<template>
  <view :id="containerDomId" class="chart-container" :style="{ width: width, height: height }">
    <!-- 微信小程序：Canvas 2D 高清 -->
    <!-- #ifdef MP-WEIXIN -->
    <canvas
      type="2d"
      :id="resolvedCanvasId"
      class="chart-canvas"
      @touchstart="onTouch"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="onClick"
    />
    <!-- #endif -->

    <!-- H5 / App / 其它端：标准 canvas，pixelRatio 固定 1 保稳定 -->
    <!-- #ifndef MP-WEIXIN -->
    <canvas
      :canvas-id="resolvedCanvasId"
      :id="resolvedCanvasId"
      class="chart-canvas"
      @touchstart="onTouch"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="onClick"
    />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import uCharts from '@qiun/ucharts'

interface ChartSeries {
  name?: string
  data: number | number[] | any[]
  [key: string]: any
}

interface ChartData {
  categories?: string[]
  series: ChartSeries[]
}

interface Props {
  /** 可选；不传时组件内自动生成，保证页内唯一 */
  canvasId?: string
  type: 'line' | 'column' | 'mount' | 'area' | 'ring' | 'pie' | 'arc' | 'gauge' | 'radar'
  chartData: ChartData
  opts?: Record<string, any>
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  canvasId: '',
  width: '100%',
  height: '350rpx',
  opts: () => ({})
})

const instance = getCurrentInstance()

/** 自动 id：仅字母数字下划线，避免 selector 特殊字符 */
const autoId = `uchart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
const resolvedCanvasId = computed(() => {
  const id = (props.canvasId || '').trim()
  return id || autoId
})
const containerDomId = computed(() => `container-${resolvedCanvasId.value}`)

let uChartsInstance: any = null
let lastSize = { width: 0, height: 0 }
let measureRetryCount = 0
let initTimer: ReturnType<typeof setTimeout> | null = null
let disposed = false

const MAX_MEASURE_RETRY = 12
const MEASURE_RETRY_MS = 50
const INIT_DEBOUNCE_MS = 16
const SIZE_EPSILON = 1

const clearInitTimer = () => {
  if (initTimer != null) {
    clearTimeout(initTimer)
    initTimer = null
  }
}

const destroyChart = () => {
  clearInitTimer()
  uChartsInstance = null
  lastSize = { width: 0, height: 0 }
}

const onTouch = (e: any) => {
  if (!uChartsInstance) return
  if (props.opts?.enableScroll) {
    uChartsInstance.scrollStart?.(e)
  }
  uChartsInstance.showToolTip(e, {
    format: (item: any, category: any) => {
      return (category ? category + ' ' : '') + item.name + ': ' + item.data
    }
  })
}

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

/** 桌面 H5：用 click 补 Tooltip */
const onClick = (e: any) => {
  if (!uChartsInstance) return
  // #ifdef H5
  uChartsInstance.showToolTip(e, {
    format: (item: any, category: any) => {
      return (category ? category + ' ' : '') + item.name + ': ' + item.data
    }
  })
  // #endif
}

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

const getCommonConfig = () => {
  const defaultExtra: Record<string, Record<string, any>> = {
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
  // 先展开用户 extra，再覆盖深合并后的已知类型，避免浅覆盖冲掉默认字段
  const mergedExtra = {
    ...userExtra,
    pie: { ...defaultExtra.pie, ...userExtra.pie },
    ring: { ...defaultExtra.ring, ...userExtra.ring },
    rose: { ...defaultExtra.rose, ...userExtra.rose },
    column: { ...defaultExtra.column, ...userExtra.column }
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

const fallbackInit = (width: number, height: number) => {
  if (disposed || !instance) return
  const ctx = uni.createCanvasContext(resolvedCanvasId.value, instance)
  uChartsInstance = new uCharts({
    type: props.type,
    context: ctx,
    pixelRatio: 1,
    width,
    height,
    ...getCommonConfig()
  })
  lastSize = { width, height }
}

const createChart = (width: number, height: number) => {
  if (disposed || !instance) return

  // #ifdef MP-WEIXIN
  const dpr = uni.getSystemInfoSync().pixelRatio || 1
  uni
    .createSelectorQuery()
    .in(instance)
    .select(`#${resolvedCanvasId.value}`)
    .fields({ node: true, size: true }, (res: any) => {
      if (disposed) return
      if (!res || !res.node) {
        fallbackInit(width, height)
        return
      }
      const canvas = res.node
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      uChartsInstance = new uCharts({
        type: props.type,
        context: ctx,
        canvas2d: true,
        pixelRatio: 1,
        width,
        height,
        ...getCommonConfig()
      })
      lastSize = { width, height }
    })
    .exec()
  // #endif

  // #ifndef MP-WEIXIN
  fallbackInit(width, height)
  // #endif
}

const measureAndInit = () => {
  if (disposed || !instance) return

  uni
    .createSelectorQuery()
    .in(instance)
    .select(`#${containerDomId.value}`)
    .boundingClientRect((rect: any) => {
      if (disposed) return
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        if (measureRetryCount < MAX_MEASURE_RETRY) {
          measureRetryCount += 1
          clearInitTimer()
          initTimer = setTimeout(() => {
            initTimer = null
            measureAndInit()
          }, MEASURE_RETRY_MS)
        }
        return
      }

      measureRetryCount = 0
      const width = rect.width
      const height = rect.height

      // 尺寸几乎不变且已有实例时，避免无意义重建
      if (
        uChartsInstance &&
        Math.abs(width - lastSize.width) < SIZE_EPSILON &&
        Math.abs(height - lastSize.height) < SIZE_EPSILON
      ) {
        return
      }

      uChartsInstance = null
      createChart(width, height)
    })
    .exec()
}

/** 防抖调度初始化（opts/type/resize 共用） */
const scheduleInit = (force = false) => {
  if (disposed) return
  if (force) {
    measureRetryCount = 0
    uChartsInstance = null
  }
  clearInitTimer()
  initTimer = setTimeout(() => {
    initTimer = null
    measureAndInit()
  }, INIT_DEBOUNCE_MS)
}

const updateChartData = (data: ChartData) => {
  if (!uChartsInstance) {
    scheduleInit(true)
    return
  }
  uChartsInstance.updateData({
    categories: data.categories || [],
    series: formatSeries(props.type, data.series || []),
    scrollPosition: 'left'
  })
}

watch(
  () => props.chartData,
  newVal => {
    updateChartData(newVal)
  },
  { deep: true }
)

watch(
  () => [props.opts, props.type, props.width, props.height, resolvedCanvasId.value] as const,
  () => {
    nextTick(() => scheduleInit(true))
  },
  { deep: true }
)

const onWindowResize = () => {
  scheduleInit(false)
}

onMounted(() => {
  disposed = false
  nextTick(() => scheduleInit(true))

  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onWindowResize)
  }
  // #endif
})

onBeforeUnmount(() => {
  disposed = true
  destroyChart()

  // #ifdef H5
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onWindowResize)
  }
  // #endif
})

defineExpose({
  /** 强制按当前容器尺寸重建 */
  resize: () => scheduleInit(true),
  /** 重新初始化（配置/类型变更后） */
  refresh: () => scheduleInit(true),
  getInstance: () => uChartsInstance
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
