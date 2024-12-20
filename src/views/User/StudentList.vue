<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table, TableColumn } from '@/components/Table'
import { Search } from '@/components/Search'
import { reactive, ref, watch } from 'vue'
import { BaseButton } from '@/components/Button'
import { useTable } from '@/hooks/web/useTable'
import { FormSchema } from '@/components/Form'
import {
  ElMessage,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElUpload,
  ElTag
} from 'element-plus'
import type { FormInstance, FormRules, UploadProps, UploadRequestOptions } from 'element-plus'
import {
  addStudent,
  batchImportStudents,
  deleteStudent,
  downloadStudentBatchImportTemplate,
  downloadStudentExcel,
  getClassList,
  getCollegeList,
  getStudents,
  updateStudent
} from '@/api/servers/api/student'
import qs from 'query-string'
import { UploadUtils } from '@/utils/uploadUtils'

// 搜索参数
const searchParams = ref<API.StudentQuery>({})
const setSearchParams = (params: API.StudentQuery) => {
  searchParams.value = params
  getList()
  getClassOptions(searchParams.value)
}
const deleteStudentId = ref<string>('')
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getStudents({
      current: currentPage.value,
      pageSize: pageSize.value,
      param: searchParams.value
    })
    return {
      list: res.data.list || [],
      total: res.data.total || 0
    }
  },
  fetchDelApi: async () => {
    if (!deleteStudentId.value) {
      ElMessage.error('请选择要删除的学生')
      return false
    }
    await deleteStudent({ id: deleteStudentId.value })
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
            <BaseButton type="danger" onClick={() => handleDelete(data.row, data.cellIndex)}>
              删除
            </BaseButton>
          </>
        )
      }
    }
  }
]

const collegeOptions = ref<{ label: string; value: string }[]>([])
const getCollegeOptions = async () => {
  try {
    const res = await getCollegeList()
    collegeOptions.value = res.data?.map((item) => ({ label: item, value: item })) || []
  } catch (error) {
    ElMessage.error('获取学院列表失败')
  }
}
getCollegeOptions()
const classOptions = ref<{ label: string; value: string }[]>([])
const getClassOptions = async (params: API.StudentQuery, source?: 'search' | 'form') => {
  console.log('params', params)
  let query: API.StudentQuery = {}
  if (source === 'search') {
    query = {
      ...(searchParams.value.college ? { college: searchParams.value.college } : {}),
      ...(searchParams.value.grade ? { grade: searchParams.value.grade } : {}),
      ...(searchParams.value.type ? { type: searchParams.value.type } : {})
    }
  } else if (source === 'form') {
    query = {
      ...(form.value.college ? { college: form.value.college } : {}),
      ...(form.value.grade ? { grade: form.value.grade } : {}),
      ...(form.value.type ? { type: form.value.type } : {})
    }
  }
  // 合并参数
  query = { ...query, ...params }
  console.log('query', query)

  try {
    const res = await getClassList({ param: query })
    classOptions.value = res.data?.map((item) => ({ label: item, value: item })) || []
    console.log('classOptions', classOptions.value)
  } catch (error) {
    console.log('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
  }
}
getClassOptions({})

const typeOptions = ['本科生', '研究生', '博士生'].map((item) => ({ label: item, value: item }))
const genderOptions = ['男', '女', '未知'].map((item) => ({ label: item, value: item }))

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
    component: 'Select',
    componentProps: {
      options: collegeOptions,
      onChange: (value: string) => {
        getClassOptions({ college: value }, 'search')
      }
    }
  },
  {
    field: 'classes',
    label: '班级',
    component: 'Select',
    componentProps: {
      options: classOptions
    }
  },
  {
    field: 'grade',
    label: '年级',
    component: 'Input',
    componentProps: {
      onChange: (value: number) => {
        getClassOptions({ grade: value }, 'search')
      }
    }
  },
  {
    field: 'type',
    label: '类型',
    component: 'Select',
    componentProps: {
      options: typeOptions,
      onChange: (value: string) => {
        getClassOptions({ type: value }, 'search')
      }
    }
  },
  {
    field: 'gender',
    label: '性别',
    component: 'Select',
    componentProps: {
      options: genderOptions
    }
  },
  {
    field: 'isVerified',
    label: '认证状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '已认证', value: true },
        { label: '未认证', value: false }
      ],
      type: 'button'
    }
  }
])

// 弹窗表单
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = ref<API.Student>({
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
  college: [{ required: true, message: '请输入学院', trigger: 'blur' }],
  classes: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  type: [{ required: true, message: '请输入类型', trigger: 'blur' }],
  gender: [{ required: true, message: '请输入性别', trigger: 'blur' }]
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

  getClassOptions({}, 'form')
}

// 编辑
const handleEdit = (row: API.Student) => {
  dialogTitle.value = '编辑学生'
  dialogVisible.value = true
  form.value = { ...row }
  getClassOptions({}, 'form')
}

// 删除
const handleDelete = async (row: API.Student, index: number) => {
  if (!row.studentId) {
    ElMessage.error('学生学号不能为空')
    return
  }
  deleteStudentId.value = row.studentId
  await tableMethods.delList(index)
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      if (!form.value.studentId) {
        ElMessage.error('学号不能为空')
        return
      }

      if (dialogTitle.value === '编辑学生') {
        // 编辑
        await updateStudent(
          {
            id: form.value.studentId
          },
          form.value
        )
        ElMessage.success('编辑成功')
      } else {
        // 新增
        await addStudent(form.value)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  })
}

// 导出学生
const handleExport = () => {
  try {
    window.open(
      qs.stringifyUrl({
        url: `${import.meta.env.VITE_API_BASE_PATH}/student/download-excel`,
        query: searchParams.value
      })
    )

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 修改下载模板方法
const downloadTemplate = async () => {
  try {
    window.open(
      qs.stringifyUrl({
        url: `${import.meta.env.VITE_API_BASE_PATH}/student/download-batch-import-template`
      })
    )

    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
  }
}

// 修改上传方法
const handleUpload = async (options: UploadRequestOptions) => {
  try {
    // 直接传入空对象和文件
    const res = await batchImportStudents({}, options.file)

    const errorList: API.ImportRowResult[] = res.data.failed || []
    const errorStr = errorList.map((item) => item.message).join('\n')

    if (errorStr) {
      ElMessage.error(errorStr)
    } else {
      ElMessage.success('全部导入成功')
      getList()
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
}

// 上传之前的验证
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isExcel =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  return true
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px flex items-center">
      <BaseButton type="primary" @click="handleAdd">新增学生</BaseButton>
      <ElUpload
        class="ml-10px"
        :auto-upload="true"
        :show-file-list="false"
        accept=".xlsx,.xls"
        :before-upload="beforeUpload"
        :http-request="handleUpload"
      >
        <BaseButton type="primary">导入学生</BaseButton>
      </ElUpload>
      <BaseButton class="ml-10px" type="primary" @click="downloadTemplate">
        下载导入模板
      </BaseButton>
      <BaseButton class="ml-10px" type="primary" @click="handleExport"> 导出学生 </BaseButton>
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
        <ElFormItem label="学号" prop="studentId" required>
          <ElInput v-model="form.studentId" placeholder="请输入学号" />
        </ElFormItem>
        <ElFormItem label="姓名" prop="name" required>
          <ElInput v-model="form.name" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="学院" prop="college" required>
          <ElSelect
            v-model="form.college"
            placeholder="请选择或输入学院"
            filterable
            allow-create
            default-first-option
            @change="() => getClassOptions({}, 'form')"
          >
            <ElOption
              v-for="item in collegeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="班级" prop="classes" required>
          <ElSelect
            v-model="form.classes"
            placeholder="请选择班级"
            filterable
            allow-create
            default-first-option
          >
            <ElOption
              v-for="item in classOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="年级" prop="grade" required>
          <ElInput
            v-model="form.grade"
            placeholder="请输入年级"
            type="number"
            @change="() => getClassOptions({}, 'form')"
          />
        </ElFormItem>
        <ElFormItem label="类型" prop="type" required>
          <ElSelect
            v-model="form.type"
            placeholder="请选择类型"
            @change="() => getClassOptions({}, 'form')"
          >
            <ElOption
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="性别" prop="gender" required>
          <ElSelect v-model="form.gender" placeholder="请选择性别">
            <ElOption
              v-for="item in genderOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem v-if="dialogTitle === '编辑学生'" label="认证状态" prop="isVerified" disabled>
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
