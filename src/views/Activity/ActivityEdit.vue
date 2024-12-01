<script setup lang="ts">
import { useEmitt } from '@/hooks/event/useEmitt'
import { useRoute, useRouter } from 'vue-router'
import { ref, unref } from 'vue'
import ActivityWrite from '@/views/Activity/components/ActivityWrite.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'

const { emit } = useEmitt()

const { push, go } = useRouter()

const { query } = useRoute()

const currentRow = ref({})

const getTableDet = async () => {
  // const res = await getTableDetApi(query.id as string)
  console.log('query', query.id)
  const res = {
    id: 1,
    name: '校园歌手大赛',
    organizer: '学生会文艺部',
    category: '文艺演出',
    location: '大学生活动中心',
    description:
      '一年一度的校园歌手大赛，展现青春风采，寻找校园音乐达人。比赛分为初赛、复赛和决赛三个阶段，欢迎所有热爱音乐的同学参与。',
    status: 'NOT_START',
    startTime: '2024-03-15 19:00:00',
    endTime: '2024-03-15 22:00:00',
    maxCapacity: 200,
    capacity: 0,
    createTime: '2024-02-20 10:00:00'
  }
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
  if (formData) {
    loading.value = true
    // const res = await saveTableApi(formData)
    //   .catch(() => {})
    //   .finally(() => {
    //     loading.value = false
    //   })
    const res = formData
    if (res) {
      emit('getList', 'editor')
      push('/activity/list')
    }
  }
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
@/hooks/event/useEmitt
