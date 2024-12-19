<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { ref, onMounted } from 'vue'
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
import {
  getActivityCategorys,
  addActivityCategory,
  updateActivityCategory,
  deleteActivityCategory
} from '@/api/servers/api/activityCategory'

interface Category {
  id: number
  name: string
  description: string
  activityCount: number
}

const { push } = useRouter()

// 替换模拟数据为真实数据
const categories = ref<Category[]>([])
const loading = ref(false)

// 添加获取数据的方法
const fetchCategories = async () => {
  try {
    loading.value = true
    const res = await getActivityCategorys({
      current: 1,
      pageSize: 20,
      param: {}
    })
    // 使用可选链和空值合并操作符，并提供默认值
    categories.value = (res.data?.list ?? []).map((item) => ({
      id: item.categoryId ?? 0, // 默认值为0
      name: item.name ?? '', // 默认值为空字符串
      description: item.description ?? '', // 默认值为空字符串
      activityCount: item.activityCount || 0
    }))
  } catch (error) {
    ElMessage.error('获取分类列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchCategories()
})

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

const handleAdd = async () => {
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
  })
    .then(async () => {
      try {
        const res = await deleteActivityCategory({
          id: category.id
        })
        if (res) {
          ElMessage.success('删除成功')
          fetchCategories() // 刷新列表数据
        }
      } catch (error) {
        ElMessage.error('删除分类失败')
        console.error(error)
      }
    })
    .catch(() => {
      // 用户点击取消按钮时，不做任何操作
    })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          // 编辑分类
          const res = await updateActivityCategory(
            {
              id: form.value.id
            },
            {
              categoryId: form.value.id,
              name: form.value.name,
              description: form.value.description
            }
          )
          if (res) {
            ElMessage.success('编辑分类成功')
            dialogVisible.value = false
            fetchCategories() // 刷新列表
          }
        } else {
          // 新增分类（保持原有逻辑）
          const res = await addActivityCategory({
            name: form.value.name,
            description: form.value.description
          })
          if (res) {
            ElMessage.success('添加分类成功')
            dialogVisible.value = false
            fetchCategories() // 刷新列表
          }
        }
      } catch (error) {
        ElMessage.error(form.value.id ? '编辑分类失败' : '添加分类失败')
        console.error(error)
      }
    }
  })
}
</script>

<template>
  <ContentWrap title="分类管理">
    <div v-loading="loading">
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
    </div>
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
