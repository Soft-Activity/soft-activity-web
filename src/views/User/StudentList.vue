<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table, TableColumn } from '@/components/Table'
import { Search } from '@/components/Search'
import { reactive, ref } from 'vue'
import { BaseButton } from '@/components/Button'
import { useTable } from '@/hooks/web/useTable'
import { FormSchema } from '@/components/Form'
import {
  ElMessage,
  ElMessageBox,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElUpload,
  ElTag
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface StudentForm {
  studentId: string
  name: string
  college: string
  classes: string
  grade: number
  type: string
  gender: string
  isVerified: boolean
}

// 模拟数据
const mockStudents = [
  {
    studentId: '2021001',
    name: '张三',
    college: '计算机学院',
    classes: '计算机2101',
    grade: 2021,
    type: '本科生',
    gender: '男',
    isVerified: true
  },
  {
    studentId: '2021002',
    name: '李四',
    college: '信息工程学院',
    classes: '信息2102',
    grade: 2021,
    type: '研究生',
    gender: '女',
    isVerified: false
  }
]

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    return {
      list: mockStudents,
      total: mockStudents.length
    }
  },
  fetchDelApi: async () => {
    return true
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

getList()

// 表格列配置
const columns: TableColumn[] = [
  {
    field: 'studentId',
    label: '学号'
  },
  {
    field: 'name',
    label: '姓名'
  },
  {
    field: 'college',
    label: '学院'
  },
  {
    field: 'classes',
    label: '班级'
  },
  {
    field: 'grade',
    label: '年级'
  },
  {
    field: 'type',
    label: '类型'
  },
  {
    field: 'gender',
    label: '性别'
  },
  {
    field: 'isVerified',
    label: '认证状态',
    slots: {
      default: (data) => {
        return (
          <ElTag type={data.row.isVerified ? 'success' : 'danger'}>
            {data.row.isVerified ? '已认证' : '未认证'}
          </ElTag>
        )
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    fixed: 'right',
    width: 200,
    slots: {
      default: (data) => {
        return (
          <>
            <BaseButton type="primary" onClick={() => handleEdit(data.row)}>
              编辑
            </BaseButton>
            <BaseButton type="danger" onClick={() => handleDelete(data.row)}>
              删除
            </BaseButton>
          </>
        )
      }
    }
  }
]

// 搜索表单配置
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'studentId',
    label: '学号',
    component: 'Input'
  },
  {
    field: 'name',
    label: '姓名',
    component: 'Input'
  },
  {
    field: 'college',
    label: '学院',
    component: 'Input'
  }
])

// 搜索参数
const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

// 弹窗表单
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = ref<StudentForm>({
  studentId: '',
  name: '',
  college: '',
  classes: '',
  grade: 0,
  type: '',
  gender: '',
  isVerified: false
})

const rules = reactive<FormRules>({
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  college: [{ required: true, message: '请输入学院', trigger: 'blur' }]
})

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增学生'
  dialogVisible.value = true
  form.value = {
    studentId: '',
    name: '',
    college: '',
    classes: '',
    grade: 0,
    type: '',
    gender: '',
    isVerified: false
  }
}

// 编辑
const handleEdit = (row: StudentForm) => {
  dialogTitle.value = '编辑学生'
  dialogVisible.value = true
  form.value = { ...row }
}

// 删除
const handleDelete = async (row: StudentForm) => {
  await tableMethods.delList(1)
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      // 模拟提交
      if (form.value.studentId) {
        // 编辑
        ElMessage.success('编辑成功')
      } else {
        // 新增
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

// 导入学生
const handleImport = (file: File) => {
  // 这里处理文件上传逻辑
  const formData = new FormData()
  formData.append('file', file)

  // 模拟上传
  setTimeout(() => {
    ElMessage.success('导入成功')
    getList()
  }, 1000)

  return false
}

// 导出学生
const handleExport = () => {
  // 这里处理导出逻辑
  const data = dataList.value
  const header = ['学号', '姓名', '学院', '班级', '年级', '类型', '性别', '认证状态']
  const content = data.map((item) => [
    item.studentId,
    item.name,
    item.college,
    item.classes,
    item.grade,
    item.type,
    item.gender,
    item.isVerified ? '已认证' : '未认证'
  ])

  // 模拟下载
  ElMessage.success('导出成功')
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px flex items-center">
      <BaseButton type="primary" @click="handleAdd">新增学生</BaseButton>
      <ElUpload
        class="ml-10px"
        :auto-upload="false"
        :show-file-list="false"
        accept=".xlsx,.xls"
        :before-upload="handleImport"
      >
        <BaseButton type="primary">导入学生</BaseButton>
      </ElUpload>
      <BaseButton class="ml-10px" type="primary" @click="handleExport">导出学生</BaseButton>
    </div>

    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :loading="loading"
      :data="dataList"
      row-key="studentId"
      :pagination="{
        total: total
      }"
      :columns="columns"
      @register="tableRegister"
    />

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElFormItem label="学号" prop="studentId">
          <ElInput v-model="form.studentId" placeholder="请输入学号" />
        </ElFormItem>
        <ElFormItem label="姓名" prop="name">
          <ElInput v-model="form.name" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="学院" prop="college">
          <ElInput v-model="form.college" placeholder="请输入学院" />
        </ElFormItem>
        <ElFormItem label="班级" prop="classes">
          <ElInput v-model="form.classes" placeholder="请输入班级" />
        </ElFormItem>
        <ElFormItem label="年级" prop="grade">
          <ElInput v-model="form.grade" placeholder="请输入年级" type="number" />
        </ElFormItem>
        <ElFormItem label="类型" prop="type">
          <ElSelect v-model="form.type" placeholder="请选择类型">
            <ElOption label="本科生" value="本科生" />
            <ElOption label="研究生" value="研究生" />
            <ElOption label="博士生" value="博士生" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="性别" prop="gender">
          <ElSelect v-model="form.gender" placeholder="请选择性别">
            <ElOption label="男" value="男" />
            <ElOption label="女" value="女" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="认证状态" prop="isVerified">
          <ElSelect v-model="form.isVerified" placeholder="请选择认证状态" disabled>
            <ElOption label="未认证" :value="false" />
            <ElOption label="已认证" :value="true" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <BaseButton @click="dialogVisible = false">取消</BaseButton>
        <BaseButton type="primary" @click="submitForm">确定</BaseButton>
      </template>
    </ElDialog>
  </ContentWrap>
</template>

<style scoped lang="less"></style>
