<script setup lang="tsx">
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import ActivityDescription from '@/views/Activity/components/ActivityDescription.vue'
import RegistrationTable from '@/views/Activity/components/RegistrationTable.vue'
import CommentTable from '@/views/Activity/components/CommentTable.vue'
import { ContentWrap } from '@/components/ContentWrap'
import { ElCard, ElTag, ElProgress } from 'element-plus'
import AIAnalysis from './components/AIAnalysis.vue'

interface ActivityDetail {
  id: number
  name: string
  organizer: string
  category: string
  location: string
  description: string
  status: string
  startTime: string
  endTime: string
  maxCapacity: number
  capacity: number
  createTime: string
  aiAnalysis?: {
    summary: string
    keywords: string[]
    sentiment: {
      positive: number
      neutral: number
      negative: number
    }
  }
}

const currentRow = ref<ActivityDetail>({} as ActivityDetail)

const { push, go } = useRouter()

const { query } = useRoute()
const getTableDet = async () => {
  // const res = await getTableDetApi(query.id as string)
  console.log('query', query.id)
  const res = {
    id: 1,
    name: '活动1',
    organizer: '组织者1',
    category: '分类1',
    location: '活动地点1',
    description: '描述1sssssssssssssssssssssssssssssssssssssssssss',
    status: 'NOT_START',
    startTime: '2024-11-26 11:00:00',
    endTime: '2024-11-26 11:00:00',
    maxCapacity: 100,
    capacity: 0,
    createTime: '2024-11-26 11:00:00',
    aiAnalysis: {
      summary:
        '根据评论分析，此活动总体评价良好。85%的参与者对活动表示满意，主要亮点在于活动组织有序和内容丰富。建议改进的方面包括场地安排和时间控制。',
      keywords: ['组织有序', '内容丰富', '场地改进', '时间控制'],
      sentiment: {
        positive: 85,
        neutral: 10,
        negative: 5
      }
    }
  }
  if (res) {
    currentRow.value = res
  }
}

getTableDet()
</script>

<template>
  <ContentDetailWrap title="活动详情页面" @back="push('/activity/list')">
    <template #header>
      <BaseButton type="primary" @click="go(-1)">
        <template #icon>
          <el-icon><ArrowLeft /></el-icon>
        </template>
        返回
      </BaseButton>
    </template>
    <div class="detail-container">
      <ActivityDescription :currentRow="currentRow" />
      <AIAnalysis v-if="currentRow?.aiAnalysis" :data="currentRow.aiAnalysis" />
      <RegistrationTable :activityId="query.id" />
      <CommentTable :activityId="query.id" />
    </div>
  </ContentDetailWrap>
</template>

<style lang="less" scoped>
.detail-container {
  .activity-description,
  .ai-analysis,
  .registration-table,
  .comment-table {
    margin-bottom: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
