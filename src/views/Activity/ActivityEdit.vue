<script setup lang="ts">
import { useEmitt } from '@/hooks/event/useEmitt'
import { useRoute, useRouter } from 'vue-router'
import { ref, unref } from 'vue'
import ActivityWrite from '@/views/Activity/components/ActivityWrite.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { getActivity, updateActivity } from '@/api/servers/api/activity'

const { emit } = useEmitt()

const { push, go } = useRouter()

const { query } = useRoute()

const currentRow = ref({})

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
  const tmpId = Number(query.id) || 1
  const response = await getActivity({
    id: tmpId
  })
  console.log('query', query.id)

  const res = {
    id: response.data.activityId,
    name: response.data.name || '校园歌手大赛',
    organizerId: response.data.organizerId || '学生会文艺部',
    categoryId: response.data.categoryId || '文艺演出',
    location: response.data.location || '大学生活动中心',
    description: response.data.description || '活动描述未提供',
    status: statusMap[Number(response.data.status) ?? 0] || '未开始',
    startTime: response.data.startTime || '2024-03-15 19:00:00',
    endTime: response.data.endTime || '2024-03-15 22:00:00',
    maxCapacity: response.data.maxCapacity || 200,
    capacity: response.data.capacity || 0,
    createTime: response.data.createTime || '2024-02-20 10:00:00'
  }

  console.log(res)
  if (res) {
    currentRow.value = res
  }
}
getTableDet()

const writeRef = ref<ComponentRef<typeof ActivityWrite>>()
const loading = ref(false)
const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  console.log('formData', formData)
  console.log('statusMap', statusMap[formData.status])
  if (formData) {
    loading.value = true
    try {
      const res = await updateActivity({ id: formData.id }, formData)
      if (res.code === 200) {
        emit('getList', 'editor')
        push('/activity/list')
      }
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
