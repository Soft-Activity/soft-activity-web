<script setup lang="ts">
import PanelGroup from './components/PanelGroup.vue'
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { reactive, ref, unref, onMounted } from 'vue'
import { Echart } from '@/components/Echart'
import type { EChartsOption } from 'echarts/types/dist/echarts'
import { getActivityCategoryStatistics } from '@/api/servers/api/activityCategory'
import { ECOption } from '@/components/Echart'
import { getActivityRecentMonthStatistics, getActivitys } from '@/api/servers/api/activity'
import { formatToDateTime } from '@/utils/dateUtil'

const loading = ref(false)

// 活动参与情况饼图
const pieOptions = ref<ECOption>({
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
    data: []
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
      data: []
    }
  ]
})

// 定义颜色数组
const colors = [
  '#1890FF', // 蓝色
  '#FF4B2B', // 红色
  '#52C41A', // 绿色
  '#722ED1', // 紫色
  '#FAAD14', // 黄色
  '#13C2C2' // 青色
]

const fetchPieOptions = async () => {
  loading.value = true
  try {
    const states = await getActivityCategoryStatistics({
      param: {
        activityStartTime: formatToDateTime(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          'YYYY-MM-DD HH:mm:ss'
        ),
        activityEndTime: formatToDateTime(new Date(Date.now()), 'YYYY-MM-DD HH:mm:ss')
      }
    })
    if (states.data) {
      // 使用 value 访问 ref 的值
      // @ts-ignore
      pieOptions.value.legend!.data = states.data?.map((item) => item.name) || []
      pieOptions.value.series![0].data = states.data.map((item, index) => ({
        value: item.totalParticipants || 0,
        name: item.name,
        itemStyle: {
          color: colors[index % colors.length]
        }
      }))
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 热门活动统计柱状图
const barOptions = ref<ECOption>({
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
})

const fetchBarOptions = async () => {
  const res = await getActivitys({
    current: 1,
    pageSize: 10,
    param: {
      //
      startTime: formatToDateTime(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      endTime: formatToDateTime(new Date(Date.now())),
      // @ts-ignore
      'sorter.column': 'capacity',
      'sorter.mode': 'desc'
    }
  })

  const states = res?.data?.list || []
  console.log(states)
  // @ts-ignore
  barOptions.value.xAxis!.data = states.map((item) => item.name)
  barOptions.value.series![0].data = states.map((item) => item.capacity)
}
// 活动趋势折线图
const lineOptions = ref<ECOption>({
  title: {
    text: '近一月活动开展趋势',
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
})

const fetchLineOptions = async () => {
  const res = await getActivityRecentMonthStatistics()
  const states = res?.data || []

  // @ts-ignore
  lineOptions.value.xAxis!.data = states.map((item) => item.date)
  lineOptions.value.series![0].data = states.map((item) => item.activityCount)
  lineOptions.value.series![1].data = states.map((item) => item.totalParticipants)
}
// 在组件挂载时获取数据
onMounted(() => {
  fetchPieOptions()
  fetchBarOptions()
  fetchLineOptions()
})
</script>

<template>
  <PanelGroup />
  <ElRow :gutter="20" justify="space-between" class="mt-20px">
    <ElCol :xl="10" :lg="10" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px chart-card">
        <ElSkeleton :loading="loading" animated>
          <Echart :options="pieOptions" :height="350" />
        </ElSkeleton>
      </ElCard>
    </ElCol>
    <ElCol :xl="14" :lg="14" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px chart-card">
        <ElSkeleton :loading="loading" animated>
          <Echart :options="barOptions" :height="350" />
        </ElSkeleton>
      </ElCard>
    </ElCol>
    <ElCol :span="24">
      <ElCard shadow="hover" class="mb-20px chart-card">
        <ElSkeleton :loading="loading" animated :rows="4">
          <Echart :options="lineOptions" :height="400" />
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
