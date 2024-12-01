<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { ref } from 'vue'
import {
  ElCard,
  ElTag,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessageBox,
  ElMessage
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'

interface Category {
  id: number
  name: string
  description: string
  activityCount: number
}

const { push } = useRouter()

// 模拟数据
const categories = ref<Category[]>([
  {
    id: 1,
    name: '学术讲座',
    description: '包括各类学术报告、研讨会等',
    activityCount: 12
  },
  {
    id: 2,
    name: '文体活动',
    description: '运动会、文艺表演等',
    activityCount: 8
  },
  {
    id: 3,
    name: '志愿服务',
    description: '社会实践、公益活动等',
    activityCount: 5
  }
])

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = ref<{
  id?: number
  name: string
  description: string
}>({
  id: undefined,
  name: '',
  description: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入分类描述', trigger: 'blur' }]
}

const handleAdd = () => {
  dialogTitle.value = '新增分类'
  dialogVisible.value = true
  form.value = {
    id: undefined,
    name: '',
    description: ''
  }
}

const handleEdit = (category: Category) => {
  dialogTitle.value = '编辑分类'
  dialogVisible.value = true
  form.value = {
    id: category.id!,
    name: category.name,
    description: category.description
  }
}

const handleDelete = (category: Category) => {
  ElMessageBox.confirm('确认删除该分类吗？', '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 调用删除 API
    ElMessage.success('删除成功')
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用保存 API
      ElMessage.success(form.value.id ? '编辑成功' : '新增成功')
      dialogVisible.value = false
    }
  })
}
</script>

<template>
  <ContentWrap title="分类管理">
    <div class="mb-10px">
      <BaseButton type="primary" @click="handleAdd">新增分类</BaseButton>
    </div>

    <div class="category-grid">
      <ElCard v-for="category in categories" :key="category.id" class="category-card">
        <template #header>
          <div class="card-header">
            <span class="category-name">{{ category.name }}</span>
          </div>
        </template>

        <div class="card-content">
          <p class="description">{{ category.description }}</p>
          <div class="activity-count"> 活动数量：{{ category.activityCount }} </div>
        </div>

        <div class="card-actions">
          <BaseButton type="primary" @click="handleEdit(category)"> 编辑 </BaseButton>
          <BaseButton type="danger" @click="handleDelete(category)"> 删除 </BaseButton>
        </div>
      </ElCard>
    </div>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px">
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入分类名称" />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <BaseButton @click="dialogVisible = false">取消</BaseButton>
        <BaseButton type="primary" @click="submitForm">确定</BaseButton>
      </template>
    </ElDialog>
  </ContentWrap>
</template>

<style lang="less" scoped>
.mb-10px {
  margin-bottom: 10px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  .category-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .category-name {
        font-weight: bold;
        font-size: 16px;
      }
    }

    .card-content {
      .description {
        color: #666;
        margin-bottom: 10px;
        min-height: 40px;
      }

      .activity-count {
        color: #409eff;
        font-size: 14px;
      }
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
