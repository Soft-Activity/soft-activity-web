<script setup lang="tsx">
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import ActivityDescription from '@/views/Activity/components/ActivityDescription.vue'
import RegistrationTable from '@/views/Activity/components/RegistrationTable.vue'
import CommentTable from '@/views/Activity/components/CommentTable.vue'
import AIAnalysis from './components/AIAnalysis.vue'
import { getActivity } from '@/api/servers/api/activity'
import { getActivityAiReview } from '@/api/servers/api/activityAiReview'
import { ElMessage } from 'element-plus'

interface ActivityDetail extends API.ActivityVO {
  aiAnalysis?: {
    aiAnalysis?: string
    averageScore?: number
    goodNum?: number
    mediumNum?: number
    poorNum?: number
  } | null
}

const statusMap = {
  0: '未开始',
  1: '进行中',
  2: '已结束',
  3: '已取消'
}

const currentRow = ref<ActivityDetail>({} as ActivityDetail)

const { push, go } = useRouter()

const { query } = useRoute()
const getTableDet = async () => {
  try {
    const [activityRes, aiAnalysisRes] = await Promise.allSettled([
      getActivity({
        id: Number(query.id) || 0
      }),
      getActivityAiReview({
        id: Number(query.id) || 0
      })
    ])
    console.log('activityRes', activityRes)
    console.log('aiAnalysisRes', aiAnalysisRes)
    // if (activityRes.status === 'fulfilled' && activityRes.value?.data) {
    //   const activityData = activityRes.value.data
    //   currentRow.value = {
    //     id: activityData.activityId || 1,
    //     name: activityData.name || 'testActivity',
    //     organizer: activityData.organizerName || 'test',
    //     category: activityData.categoryName || 'testCategory',
    //     location: activityData.location || 'testLocation',
    //     description: activityData.description || 'testDescription',
    //     status: statusMap[Number(activityData.status) ?? 0] || '未开始',
    //     startTime: activityData.startTime || '2024-03-15 19:00:00',
    //     endTime: activityData.endTime || '2024-03-15 22:00:00',
    //     maxCapacity: activityData.maxCapacity || 200,
    //     capacity: activityData.capacity || 0,
    //     createTime: activityData.createTime || '2024-03-15 22:00:00',
    //     aiAnalysis: aiAnalysisRes.status === 'fulfilled' ? aiAnalysisRes.value?.data || null : null
    //   }
    // }
    if (activityRes.status === 'fulfilled' && activityRes.value?.data) {
      currentRow.value = {
        ...activityRes.value.data,
        aiAnalysis: aiAnalysisRes.status === 'fulfilled' ? aiAnalysisRes.value?.data || null : null
      }
    }
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error('获取活动详情失败，请稍后重试')
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
      <RegistrationTable :activityId="query.id" :isCheckIn="currentRow.isCheckIn" />
      <CommentTable v-if="currentRow.status === 2" :activityId="query.id" />
      <AIAnalysis
        v-if="
          currentRow.status === 2 &&
          currentRow?.aiAnalysis &&
          Object.keys(currentRow.aiAnalysis).length > 0
        "
        :data="currentRow.aiAnalysis"
      />
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
