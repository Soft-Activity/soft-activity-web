<script setup lang="ts">
import PanelGroup from './components/PanelGroup.vue'
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { reactive, ref } from 'vue'
import { Echart } from '@/components/Echart'
import { EChartsOption } from 'echarts'

const loading = ref(false)

// 活动参与情况饼图
const pieOptions: EChartsOption = {
  title: {
    text: '本周活动参与情况统计',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c}人 ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['学术讲座', '文体活动', '志愿服务', '社会实践']
  },
  series: [
    {
      name: '活动参与情况',
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['50%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 328, name: '学术讲座', itemStyle: { color: '#1890FF' } },
        { value: 562, name: '文体活动', itemStyle: { color: '#FF4B2B' } },
        { value: 246, name: '志愿服务', itemStyle: { color: '#52C41A' } },
        { value: 183, name: '社会实践', itemStyle: { color: '#722ED1' } }
      ]
    }
  ]
}

const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption

// 热门活动统计柱状图
const barOptions: EChartsOption = {
  title: {
    text: '本周热门活动参与人数TOP10',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [
      '创新创业讲座',
      '校园马拉松',
      '环保志愿行',
      '读书分享会',
      '篮球联赛',
      '科技创新展',
      '公益义卖',
      '心理健康讲座',
      '摄影比赛',
      '职业规划课'
    ],
    axisLabel: {
      interval: 0,
      rotate: 30
    }
  },
  yAxis: {
    type: 'value',
    name: '参与人数'
  },
  series: [
    {
      name: '参与人数',
      type: 'bar',
      data: [156, 142, 138, 125, 118, 112, 98, 95, 88, 82],
      itemStyle: {
        color: new Function(
          'params',
          `
          const colors = ['#1890FF', '#FF4B2B', '#52C41A', '#722ED1', '#FA8C16', '#13C2C2', '#2F54EB', '#F5222D', '#EB2F96', '#FFB100'];
          return colors[params.dataIndex];
        `
        ) as any
      },
      barWidth: '40%',
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(180, 180, 180, 0.1)'
      }
    }
  ]
}

const barOptionsData = reactive<EChartsOption>(barOptions) as EChartsOption

// 活动趋势折线图
const lineOptions: EChartsOption = {
  title: {
    text: '近一年活动开展趋势',
    left: 'center',
    textStyle: {
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['活动数量', '参与人数'],
    bottom: 0
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  },
  yAxis: [
    {
      type: 'value',
      name: '活动数量',
      position: 'left'
    },
    {
      type: 'value',
      name: '参与人数',
      position: 'right'
    }
  ],
  series: [
    {
      name: '活动数量',
      type: 'line',
      smooth: true,
      data: [12, 8, 15, 18, 20, 25, 22, 10, 28, 32, 35, 30],
      itemStyle: {
        color: '#1890FF'
      }
    },
    {
      name: '参与人数',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: [280, 150, 320, 380, 420, 560, 480, 220, 620, 680, 750, 650],
      itemStyle: {
        color: '#52C41A'
      }
    }
  ]
}

const lineOptionsData = reactive<EChartsOption>(lineOptions) as EChartsOption
</script>

<template>
  <PanelGroup />
  <ElRow :gutter="20" justify="space-between" class="mt-20px">
    <ElCol :xl="10" :lg="10" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px chart-card">
        <ElSkeleton :loading="loading" animated>
          <Echart :options="pieOptionsData" :height="350" />
        </ElSkeleton>
      </ElCard>
    </ElCol>
    <ElCol :xl="14" :lg="14" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px chart-card">
        <ElSkeleton :loading="loading" animated>
          <Echart :options="barOptionsData" :height="350" />
        </ElSkeleton>
      </ElCard>
    </ElCol>
    <ElCol :span="24">
      <ElCard shadow="hover" class="mb-20px chart-card">
        <ElSkeleton :loading="loading" animated :rows="4">
          <Echart :options="lineOptionsData" :height="400" />
        </ElSkeleton>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<style scoped>
.mt-20px {
  margin-top: 20px;
}

.chart-card {
  transition: all 0.3s;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
