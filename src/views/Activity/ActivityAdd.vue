<script setup lang="tsx">
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRouter } from 'vue-router'
import ActivityWrite from '@/views/Activity/components/ActivityWrite.vue'
import { ref, unref } from 'vue'
import { useEmitt } from '@/hooks/event/useEmitt'
import { ElMessage } from 'element-plus'

const { push, go } = useRouter()
const currentRow = ref(null)
const { emit } = useEmitt()

const writeRef = ref<ComponentRef<typeof ActivityWrite>>()
const loading = ref(false)
const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()

  if (!formData) {
    return // 如果表单验证失败，直接返回
  }

  try {
    loading.value = true
    // const res = await saveTableApi(formData)
    const res = formData
    if (res) {
      emit('getList', 'add')
      push('/activity/list')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <ContentDetailWrap title="新增活动" @back="push('/activity/list')">
    <ActivityWrite ref="writeRef" :current-row="currentRow" />
    <template #header>
      <BaseButton @click="go(-1)">返回</BaseButton>
      <BaseButton type="primary" :loading="loading" @click="save"> 保存 </BaseButton>
    </template>
  </ContentDetailWrap>
</template>
@/hooks/event/useEmitt
