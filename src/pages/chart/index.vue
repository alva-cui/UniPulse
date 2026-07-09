<template>
  <view class="container">
    <view class="header">
      <view class="header-title">数据分析看板</view>
      <view class="header-desc">多端一致的高清数据图表展示</view>
    </view>

    <!-- 图表卡片网格 -->
    <view class="chart-list">
      <!-- 1. 折线图 (Line Chart) -->
      <view class="card">
        <view class="title-bar">
          <text class="title">今日销售额趋势</text>
          <text class="tag">今日</text>
        </view>
        <MyChart canvasId="salesLineChart" type="line" :chartData="salesData" :opts="lineOptions" />
      </view>

      <!-- 2. 柱状图 (Column Chart) -->
      <view class="card">
        <view class="title-bar">
          <text class="title">季度数码产品销售对比</text>
          <text class="tag">双维度</text>
        </view>
        <MyChart canvasId="quarterSalesColumnChart" type="column" :chartData="monthlySalesData" :opts="columnOptions" />
      </view>

      <!-- 3. 区域渐变图 (Area Chart) -->
      <view class="card">
        <view class="title-bar">
          <text class="title">实时在线活跃用户</text>
          <text class="tag animate">实时</text>
        </view>
        <MyChart canvasId="activeUsersAreaChart" type="area" :chartData="activeUsersData" :opts="areaOptions" />
      </view>

      <!-- 4. 经典饼图 (Pie Chart - 兼容 ECharts 嵌套风格) -->
      <view class="card">
        <view class="title-bar">
          <text class="title">销售渠道占比</text>
          <text class="tag">占比</text>
        </view>
        <MyChart canvasId="channelPieChart" type="pie" :chartData="pieData" />
      </view>

      <!-- 5. 进度圆环图 (Ring Chart - 带有中心数字和副标题) -->
      <view class="card">
        <view class="title-bar">
          <text class="title">核心预算执行率</text>
          <text class="tag">指标</text>
        </view>
        <MyChart canvasId="budgetRingChart" type="ring" :chartData="budgetData" :opts="ringOptions" />
      </view>

      <!-- 6. 雷达图 (Radar Chart) -->
      <view class="card">
        <view class="title-bar">
          <text class="title">技术人员核心能力评估</text>
          <text class="tag">雷达</text>
        </view>
        <MyChart canvasId="radarChart" type="radar" :chartData="radarData" :opts="radarOptions" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MyChart from '@/components/uCharts/index.vue' // 引入我们抽离好的高清自适应组件

// ==========================================
// 1. 折线图数据 (Line)
// ==========================================
const salesData = ref({
  categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  series: [
    {
      name: '成交额 (万元)',
      data: [120, 132, 101, 134, 90, 230, 210]
    }
  ]
})

const lineOptions = {
  extra: {
    line: {
      width: 2,
      activeType: 'circle'
    }
  }
}

// ==========================================
// 2. 柱状图数据 (Column)
// ==========================================
const monthlySalesData = ref({
  categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    {
      name: '智能手机',
      data: [35, 36, 31, 33, 13, 34]
    },
    {
      name: '平板电脑',
      data: [18, 27, 21, 24, 6, 28]
    }
  ]
})

const columnOptions = {
  xAxis: {
    rotateLabel: true // x 轴标签过多时支持自动倾斜
  }
}

// ==========================================
// 3. 区域渐变图数据 (Area)
// ==========================================
const activeUsersData = ref({
  categories: ['10点', '11点', '12点', '13点', '14点', '15点'],
  series: [
    {
      name: '活跃人数',
      data: [300, 420, 560, 390, 500, 680]
    }
  ]
})

const areaOptions = {
  extra: {
    area: {
      type: 'curve', // 贝塞尔曲线平滑过渡
      opacity: 0.25, // 背景透明度
      addLine: true, // 绘制曲线边框
      width: 2, // 曲线粗细
      gradient: true // 开启颜色渐变
    }
  }
}

// ==========================================
// 4. 经典饼图数据 (Pie) - 已适配 ECharts 兼容格式
// ==========================================
const pieData = ref({
  series: [
    {
      data: [
        { name: '线上商城', value: 50 },
        { name: '线下门店', value: 30 },
        { name: '分销渠道', value: 20 }
      ]
    }
  ]
})

// ==========================================
// 5. 进度圆环图数据 (Ring) - 自带中心数据
// ==========================================
const budgetData = ref({
  series: [
    { name: '研发支出', data: 45 },
    { name: '市场拓展', data: 25 },
    { name: '日常行政', data: 15 },
    { name: '预备资金', data: 15 }
  ]
})

const ringOptions = {
  // 圆环正中心渲染的主标题
  title: {
    name: '85%',
    fontSize: 22,
    color: '#1890FF',
    offsetY: -3 // 微调上下位置，适应多端渲染差异
  },
  // 圆环正中心的副标题
  subtitle: {
    name: '整体执行率',
    fontSize: 11,
    color: '#888888',
    offsetY: 3
  },
  extra: {
    ring: {
      ringWidth: 16, // 圆环厚度
      activeRadius: 10, // 点击高亮溢出半径
      labelWidth: 12 // 标示引线文字范围
    }
  }
}

// ==========================================
// 6. 雷达图数据 (Radar)
// ==========================================
const radarData = ref({
  categories: ['技术深度', '沟通能力', '团队协同', '抗压能力', '业务理解', '创新精神'],
  series: [
    {
      name: '资深开发标准',
      data: [90, 80, 85, 80, 75, 85]
    },
    {
      name: '当前面试候选人',
      data: [95, 70, 80, 90, 65, 75]
    }
  ]
})

const radarOptions = {
  extra: {
    radar: {
      gridType: 'polygon', // 蜘蛛网多边形样式
      gridCount: 4, // 圈数
      opacity: 0.2 // 雷达区域覆盖透明度
    }
  }
}

// 模拟页面初始化时的延迟 API 请求，用于验证图表异步加载的平滑体验
onMounted(() => {
  setTimeout(() => {
    // 改变今日活跃人数（折线图）来测试动态平滑过渡
    salesData.value.series[0].data = [140, 155, 95, 160, 110, 240, 235]
  }, 2000)
})
</script>

<style scoped>
.container {
  padding: 30rpx;
  background-color: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 顶部头部样式 */
.header {
  margin-bottom: 30rpx;
}
.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a1a1a;
  line-height: 1.5;
}
.header-desc {
  font-size: 24rpx;
  color: #888888;
  margin-top: 6rpx;
}

/* 列表卡片网格 */
.chart-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

/* 单个卡片容器 */
.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* 卡片标题栏 */
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-left: 10rpx;
  border-left: 6rpx solid #1890ff; /* 竖线标示 */
}
.title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}
.tag {
  font-size: 20rpx;
  color: #1890ff;
  background-color: #e6f7ff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

/* 特色呼吸状态 tag */
.tag.animate {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
