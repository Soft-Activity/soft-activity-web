<script setup lang="ts">
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import { onMounted, ref } from 'vue'
import { getActivityCategoryStatistics } from '@/api/servers/api/activityCategory'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('panel')

const loading = ref(false)
interface ActivityCategoryStatVO extends API.ActivityCategoryStatVO {
  color: string
}
const activityStats = ref<ActivityCategoryStatVO[]>()

// 定义颜色数组
const colors = [
  '#1890FF', // 蓝色
  '#52C41A', // 绿色
  '#FAAD14', // 黄色
  '#F5222D', // 红色
  '#722ED1', // 紫色
  '#13C2C2' // 青色
]

const fetchActivityStats = async () => {
  loading.value = true
  try {
    const res = await getActivityCategoryStatistics({ param: {} })
    activityStats.value = res.data.map((stat, index) => ({
      ...stat,
      color: colors[index % colors.length] // 循环使用颜色数组
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchActivityStats()
})
</script>

<template>
  <ElRow :gutter="20" justify="start" :class="prefixCls">
    <ElCol
      v-for="(stat, index) in activityStats"
      :key="index"
      :xl="4"
      :lg="4"
      :md="12"
      :sm="12"
      :xs="24"
    >
      <ElCard shadow="hover" class="mb-20px card-item" :style="{ background: stat.color }">
        <ElSkeleton :loading="loading" animated :rows="4">
          <template #default>
            <div :class="`${prefixCls}__item flex flex-wrap justify-between`">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-15px">
                  <div :class="`${prefixCls}__item--title text-20px font-bold text-white`">
                    {{ stat.name }}
                  </div>
                </div>
                <div :class="`${prefixCls}__item--stats`">
                  <div class="stat-row">
                    <div class="stat-label">进行中活动</div>
                    <div class="stat-value">{{ stat.ongoing }}个</div>
                  </div>
                  <div class="stat-row">
                    <div class="stat-label">累计参与人数</div>
                    <div class="stat-value">{{ stat.totalParticipants }}人</div>
                  </div>
                </div>
                <div class="activity-type">{{ stat.name }}</div>
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>
    <!-- <ElCol :xl="4" :lg="4" :md="12" :sm="12" :xs="24">
      <ElCard class="mb-20px hover:cursor-pointer hover:shadow-lg transition-all duration-300">
        <div :class="`${prefixCls}__item flex flex-col justify-center items-center h-full`">
          <Icon icon="carbon:add" :size="40" class="text-gray-400 mb-10px" />
          <div class="text-16px text-gray-500">新增类型</div>
        </div>
      </ElCard>
    </ElCol> -->
  </ElRow>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-panel';

.@{prefix-cls} {
  &__item {
    height: 132px;

    &--title {
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    &--stats {
      .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}

.card-item {
  transition: all 0.3s ease;
  :deep(.el-card__body) {
    padding: 20px;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
}

.activity-type {
  position: absolute;
  bottom: 15px;
  right: 15px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.mb-15px {
  margin-bottom: 15px;
}
</style>
