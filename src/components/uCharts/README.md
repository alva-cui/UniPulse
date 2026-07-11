# uCharts 图表组件使用说明

对 `@qiun/ucharts` 的封装，统一处理多端 Canvas、容器尺寸、数据更新与 Tooltip。业务侧只需传图表类型和数据即可出图。

完整演示见：`src/pages/chart/index.vue`。

---

## 快速开始

```vue
<template>
  <MyChart type="line" :chartData="salesData" :opts="lineOptions" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MyChart from '@/components/uCharts/index.vue'

const salesData = ref({
  categories: ['周一', '周二', '周三', '周四', '周五'],
  series: [{ name: '成交额', data: [120, 132, 101, 134, 90] }]
})

const lineOptions = {
  extra: {
    line: { width: 2, activeType: 'circle' }
  }
}
</script>
```

同页多图时建议显式传入 `canvasId`，避免调试时不好区分：

```vue
<MyChart canvasId="salesLine" type="line" :chartData="salesData" />
```

---

## Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `type` | 见下方图表类型 | 是 | — | 图表类型 |
| `chartData` | `ChartData` | 是 | — | 图表数据 |
| `opts` | `Record<string, any>` | 否 | `{}` | uCharts 配置，会与组件默认配置合并 |
| `canvasId` | `string` | 否 | 自动生成 | Canvas 唯一标识；不传时内部生成 `uchart_xxx` |
| `width` | `string` | 否 | `'100%'` | 容器宽度（支持 `px` / `rpx` / `%`） |
| `height` | `string` | 否 | `'350rpx'` | 容器高度 |

### 图表类型 `type`

`line` | `column` | `mount` | `area` | `ring` | `pie` | `arc` | `gauge` | `radar`

### 数据格式 `chartData`

```ts
interface ChartData {
  categories?: string[]  // 类目轴（折线/柱状/面积/雷达等）
  series: Array<{
    name?: string
    data: number | number[] | any[]
    [key: string]: any
  }>
}
```

---

## 数据示例

### 折线 / 柱状 / 面积（类目 + 系列）

```ts
const chartData = {
  categories: ['1月', '2月', '3月', '4月'],
  series: [
    { name: '手机', data: [35, 36, 31, 33] },
    { name: '平板', data: [18, 27, 21, 24] }
  ]
}
```

### 饼图（兼容 ECharts 嵌套写法）

组件会自动把 ECharts 风格的 `{ name, value }` 转成 uCharts 需要的格式：

```ts
// 方式 A：ECharts 风格（推荐，少改后端结构）
const pieData = {
  series: [
    {
      data: [
        { name: '线上', value: 50 },
        { name: '线下', value: 30 },
        { name: '分销', value: 20 }
      ]
    }
  ]
}

// 方式 B：uCharts 原生
const pieDataNative = {
  series: [
    { name: '线上', data: 50 },
    { name: '线下', data: 30 },
    { name: '分销', data: 20 }
  ]
}
```

`ring`、`rose` 同样支持上述两种写法。

### 圆环图（中心标题）

```ts
const budgetData = {
  series: [
    { name: '研发', data: 45 },
    { name: '市场', data: 25 },
    { name: '行政', data: 15 },
    { name: '预备', data: 15 }
  ]
}

const ringOptions = {
  title: { name: '85%', fontSize: 22, color: '#1890FF', offsetY: -3 },
  subtitle: { name: '整体执行率', fontSize: 11, color: '#888888', offsetY: 3 },
  extra: {
    ring: { ringWidth: 16, activeRadius: 10, labelWidth: 12 }
  }
}
```

```vue
<MyChart type="ring" :chartData="budgetData" :opts="ringOptions" />
```

### 雷达图

```ts
const radarData = {
  categories: ['技术', '沟通', '协同', '抗压', '业务', '创新'],
  series: [
    { name: '标准', data: [90, 80, 85, 80, 75, 85] },
    { name: '候选人', data: [95, 70, 80, 90, 65, 75] }
  ]
}

const radarOptions = {
  extra: {
    radar: { gridType: 'polygon', gridCount: 4, opacity: 0.2 }
  }
}
```

---

## opts 常用项

`opts` 会透传给 uCharts，并与组件默认配置合并。`extra` 中的 `pie` / `ring` / `rose` / `column` 会做**深合并**，只改部分字段不会冲掉默认值。

| 配置 | 说明 | 示例 |
|------|------|------|
| `extra.line` | 折线样式 | `{ width: 2, activeType: 'circle' }` |
| `extra.area` | 面积图 | `{ type: 'curve', opacity: 0.25, gradient: true }` |
| `extra.column` | 柱状图 | `{ type: 'group', width: 20 }` |
| `extra.ring` | 圆环 | `{ ringWidth: 16 }` |
| `xAxis` / `yAxis` | 坐标轴 | `{ rotateLabel: true }` |
| `legend` | 图例 | `{ show: true }` |
| `enableScroll` | 横向滚动 | `true`（需配合 touch 滑动） |
| `color` | 系列色板 | `['#1890FF', '#91CB74', ...]` |
| `padding` | 内边距 | `[15, 15, 0, 15]` |
| `animation` | 动画 | `true` / `false` |

更完整的配置项见 [uCharts 官方文档](https://www.ucharts.cn/)。

---

## 数据更新

`chartData` 使用 `ref` 并保持引用更新即可，组件会深度监听并调用 `updateData`：

```ts
// 异步请求后更新
salesData.value = {
  categories: [...],
  series: [{ name: '成交额', data: [140, 155, 95, 160, 110] }]
}

// 或只改 series 内数据
salesData.value.series[0].data = [140, 155, 95, 160, 110]
```

修改 `type`、`opts`、`width`、`height` 会触发重新初始化（带防抖）。

---

## 对外方法（defineExpose）

```vue
<template>
  <MyChart ref="chartRef" type="line" :chartData="salesData" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MyChart from '@/components/uCharts/index.vue'

const chartRef = ref<InstanceType<typeof MyChart> | null>(null)

// 容器尺寸变化后强制按新尺寸重建
chartRef.value?.resize()

// 等同于 refresh，强制重新初始化
chartRef.value?.refresh()

// 拿到底层 uCharts 实例（高级用法）
const inst = chartRef.value?.getInstance()
</script>
```

| 方法 | 说明 |
|------|------|
| `resize()` | 重新测量容器并重建图表 |
| `refresh()` | 同 `resize`，强制重建 |
| `getInstance()` | 返回 uCharts 实例，可能为 `null` |

侧栏折叠、Tab 切换显示后图表空白时，可在可见后调用 `resize()`。

---

## 多端说明

| 平台 | 策略 |
|------|------|
| 微信小程序 | Canvas 2D + 设备 `pixelRatio`，高分屏更清晰 |
| H5 / App / 其它小程序 | 标准 canvas，`pixelRatio: 1`，优先稳定 |
| H5 | 监听 `window.resize` 自动重绘；支持鼠标 `click` 显示 Tooltip |
| 触控端 | `touchstart` 显示 Tooltip；`enableScroll` 时支持横向拖动 |

容器宽高在布局未就绪（为 0）时会自动短重试，无需业务侧再写 `setTimeout`。

---

## 注意事项

1. **同页多图**：可不传 `canvasId`（自动生成）；若要固定 id，请保证页内唯一，且仅使用字母、数字、下划线。
2. **高度**：默认 `350rpx`。父级高度为 0 或 `height: 100%` 链路断裂时，图表量不到尺寸会画不出来，请给容器明确高度。
3. **空数据**：`series` 为空时仍会初始化，表现为空白图；有数据后再赋 `chartData` 即可更新。
4. **滚动图表**：需在 `opts` 中设 `enableScroll: true`，并通常配合 `xAxis.itemCount` 等（见 uCharts 文档）。
5. **密钥与请求**：组件只负责渲染，数据请在页面/`api` 层拉取，不要在组件内写业务接口。

---

## 文件结构

```
src/components/uCharts/
├── index.vue    # 组件实现
└── README.md    # 本说明
```
