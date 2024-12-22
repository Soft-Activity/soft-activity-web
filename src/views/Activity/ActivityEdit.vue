<script setup lang="ts">
import { useEmitt } from '@/hooks/event/useEmitt'
import { useRoute, useRouter } from 'vue-router'
import { ref, unref } from 'vue'
import ActivityWrite from '@/views/Activity/components/ActivityWrite.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { getActivity, updateActivity } from '@/api/servers/api/activity'
import { ElMessage } from 'element-plus'

const { emit } = useEmitt()

const { push, go } = useRouter()

const { query } = useRoute()

const currentRow = ref<API.ActivityVO>({})

// 添加状态映射对象，使用数字作为key
const statusMap = {
  0: '未开始',
  1: '进行中',
  2: '已结束',
  3: '已取消',
  未开始: 0,
  进行中: 1,
  已结束: 2,
  已取消: 3
}

const getTableDet = async () => {
  console.log('query', query.id)
  if (!query.id) {
    ElMessage.error('活动ID不存在')
    return
  }
  const response = await getActivity({
    id: Number(query.id)
  })

  // const res = {
  //   id: response.data.activityId,
  //   name: response.data.name || '校园歌手大赛',
  //   organizerId: response.data.organizerId || '学生会文艺部',
  //   categoryId: response.data.categoryId || '文艺演出',
  //   location: response.data.location || '大学生活动中心',
  //   description: response.data.description || '活动描述未提供',
  //   status: statusMap[Number(response.data.status) ?? 0] || '未开始',
  //   startTime: response.data.startTime || '2024-03-15 19:00:00',
  //   endTime: response.data.endTime || '2024-03-15 22:00:00',
  //   maxCapacity: response.data.maxCapacity || 200,
  //   capacity: response.data.capacity || 0,
  //   createTime: response.data.createTime || '2024-02-20 10:00:00'
  // }

  console.log(response.data)
  if (response.data) {
    currentRow.value = response.data
  }
}
getTableDet()

const writeRef = ref<ComponentRef<typeof ActivityWrite>>()
const loading = ref(false)
const save = async () => {
  const write = unref(writeRef)
  const formData = (await write?.submit()) as API.ActivityVO
  console.log('formData', formData)
  if (formData) {
    if (!formData.activityId) {
      ElMessage.error('活动ID不存在')
      return
    }
    loading.value = true
    try {
      await updateActivity({ id: formData.activityId }, formData)
      emit('getList', 'editor')
      push('/activity/list')
    } catch (error) {
      console.error('更新活动失败:', error)
    } finally {
      loading.value = false
    }
  }
  go(-1)
}
</script>

<template>
  <ContentDetailWrap title="活动编辑页面" @back="push('/activity/list')">
    <ActivityWrite ref="writeRef" :current-row="currentRow" />
    <template #header>
      <BaseButton @click="go(-1)"> 返回 </BaseButton>
      <BaseButton type="primary" :loading="loading" @click="save"> 保存 </BaseButton>
    </template>
  </ContentDetailWrap>
</template>
