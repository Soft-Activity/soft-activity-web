<script lang="ts" setup>
import { ref } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage,
  ElTag
} from 'element-plus'
import type { FormInstance } from 'element-plus'

interface StudentInfo {
  studentId: string
  name: string
  college: string
  classes: string
  grade: number
  type: string
  gender: string
  isVerified: boolean
}

const props = defineProps<{
  studentInfo: StudentInfo
}>()

const formRef = ref<FormInstance>()
const form = ref<StudentInfo>(props.studentInfo)

// 学生类型选项
const studentTypes = [
  { label: '本科生', value: '本科生' },
  { label: '研究生', value: '研究生' },
  { label: '博士生', value: '博士生' }
]

// 年级选项
const gradeOptions = Array.from({ length: 6 }, (_, i) => ({
  label: `${i + 1}年级`,
  value: i + 1
}))

const handleSubmit = async () => {
  ElMessage.success('信息已更新')
}
</script>

<template>
  <ElForm ref="formRef" :model="form" label-width="120px" disabled>
    <ElFormItem label="学号">
      <ElInput v-model="form.studentId" disabled />
    </ElFormItem>
    <ElFormItem label="姓名">
      <ElInput v-model="form.name" disabled />
    </ElFormItem>
    <ElFormItem label="学院">
      <ElInput v-model="form.college" disabled />
    </ElFormItem>
    <ElFormItem label="班级">
      <ElInput v-model="form.classes" disabled />
    </ElFormItem>
    <ElFormItem label="年级">
      <ElSelect v-model="form.grade" disabled>
        <ElOption
          v-for="option in gradeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="学生类型">
      <ElSelect v-model="form.type" disabled>
        <ElOption
          v-for="type in studentTypes"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="性别">
      <ElSelect v-model="form.gender" disabled>
        <ElOption label="男" value="男" />
        <ElOption label="女" value="女" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="认证状态">
      <ElTag :type="form.isVerified ? 'success' : 'warning'">
        {{ form.isVerified ? '已认证' : '未认证' }}
      </ElTag>
    </ElFormItem>
  </ElForm>
</template>

<style lang="less" scoped>
.empty-info {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
