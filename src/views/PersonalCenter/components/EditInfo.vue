<script lang="ts" setup>
import { ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElSelect, ElButton, ElMessage, ElOption } from 'element-plus'
import type { FormInstance } from 'element-plus'

interface UserInfo {
  userId: string
  name: string
  college: string
  gender: string
  avatar: string
}

const props = defineProps<{
  userInfo: UserInfo
}>()

const formRef = ref<FormInstance>()
const form = ref<UserInfo>(props.userInfo)

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  college: [{ required: true, message: '请输入学院/部门', trigger: 'blur' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 这里可以调用更新接口
      ElMessage.success('信息已更新')
    }
  })
}
</script>

<template>
  <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
    <ElFormItem label="学号/学工号">
      <ElInput v-model="form.userId" disabled />
    </ElFormItem>
    <ElFormItem label="姓名" prop="name">
      <ElInput v-model="form.name" />
    </ElFormItem>
    <ElFormItem label="性别" prop="gender">
      <ElSelect v-model="form.gender">
        <ElOption label="男" value="男" />
        <ElOption label="女" value="女" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="学院/部门" prop="college">
      <ElInput v-model="form.college" />
    </ElFormItem>
    <ElFormItem>
      <ElButton type="primary" @click="handleSubmit">保存</ElButton>
    </ElFormItem>
  </ElForm>
</template>
