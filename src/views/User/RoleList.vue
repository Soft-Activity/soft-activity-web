<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table, TableColumn } from '@/components/Table'
import { Search } from '@/components/Search'
import { reactive, ref, unref } from 'vue'
import { BaseButton } from '@/components/Button'
import { useTable } from '@/hooks/web/useTable'
import { FormSchema } from '@/components/Form'
import { ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface RoleForm {
  roleId?: number
  cname: string
  ename: string
}

// 模拟数据
const mockRoles = [
  {
    roleId: 1,
    cname: '超级管理员',
    ename: 'SUPER_ADMIN'
  },
  {
    roleId: 2,
    cname: '老师',
    ename: 'TEACHER'
  },
  {
    roleId: 3,
    cname: '学生',
    ename: 'STUDENT'
  },
  {
    roleId: 4,
    cname: '普通管理员',
    ename: 'ADMIN'
  },
  {
    roleId: 5,
    cname: '游客',
    ename: 'GUEST'
  },
  {
    roleId: 6,
    cname: '普通用户',
    ename: 'USER'
  }
]

const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState

    console.log('currentPage', unref(currentPage))
    console.log('pageSize', unref(pageSize))
    const res = {
      data: {
        list: [
          {
            roleId: 1,
            cname: '超级管理员',
            ename: 'SUPER_ADMIN'
          },
          {
            roleId: 2,
            cname: '老师',
            ename: 'TEACHER'
          },
          {
            roleId: 3,
            cname: '学生',
            ename: 'STUDENT'
          },
          {
            roleId: 4,
            cname: '普通管理员',
            ename: 'ADMIN'
          },
          {
            roleId: 5,
            cname: '游客',
            ename: 'GUEST'
          },
          {
            roleId: 6,
            cname: '普通用户',
            ename: 'USER'
          }
        ],
        total: 6
      }
    }
    return {
      list: res.data.list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    return true
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const {} = tableMethods

// 表格列配置
const columns: TableColumn[] = [
  {
    field: 'roleId',
    label: '角色ID',
    width: 80
  },
  {
    field: 'cname',
    label: '角色中文名称'
  },
  {
    field: 'ename',
    label: '角色英文名称'
  },
  {
    field: 'action',
    label: '操作',
    width: 350,
    showOverflowTooltip: false,
    fixed: 'right',
    slots: {
      default: (data: { row: RoleForm }) => {
        return (
          <>
            <BaseButton type="primary" onClick={() => handleEdit(data.row)}>
              编辑
            </BaseButton>
            <BaseButton type="danger" onClick={() => handleDelete(data.row.roleId!)}>
              删除
            </BaseButton>
          </>
        )
      }
    }
  }
]

// 搜索相关
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'cname',
    label: '角色中文名称',
    component: 'Input',
    colProps: {
      span: 8
    }
  },
  {
    field: 'ename',
    label: '角色英文名称',
    component: 'Input',
    colProps: {
      span: 8
    }
  }
])

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  tableMethods.getList()
}

// 弹窗表单
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = ref<RoleForm>({
  cname: '',
  ename: ''
})

// 表单校验规则
const rules = ref<FormRules>({
  cname: [{ required: true, message: '请输入角色中文名称', trigger: 'blur' }],
  ename: [{ required: true, message: '请输入角色英文名称', trigger: 'blur' }]
})

// 新增角色
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
  form.value = {
    cname: '',
    ename: ''
  }
}

// 编辑角色
const handleEdit = (row: RoleForm) => {
  dialogTitle.value = '编辑角色'
  dialogVisible.value = true
  form.value = { ...row }
}

// 删除角色
const handleDelete = (roleId: number) => {
  ElMessageBox.confirm('确认删除该角色?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 模拟删除
      const index = mockRoles.findIndex((item) => item.roleId === roleId)
      if (index > -1) {
        mockRoles.splice(index, 1)
        ElMessage.success('删除成功')
        tableMethods.getList()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 模拟提交
        if (form.value.roleId) {
          // 编辑
          const index = mockRoles.findIndex((item) => item.roleId === form.value.roleId)
          if (index > -1 && form.value.roleId) {
            mockRoles[index] = { ...form.value } as {
              roleId: number
              cname: string
              ename: string
            }
          }
        } else {
          // 新增
          mockRoles.push({
            ...form.value,
            roleId: mockRoles.length + 1
          })
        }
        ElMessage.success(`${dialogTitle.value}成功`)
        dialogVisible.value = false
        tableMethods.getList()
      } catch (error) {
        ElMessage.error(`${dialogTitle.value}失败`)
      }
    }
  })
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <BaseButton type="primary" @click="handleAdd">新增角色</BaseButton>
    </div>

    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :loading="loading"
      :data="dataList"
      row-key="roleId"
      :pagination="{
        total: total
      }"
      :columns="columns"
      @register="tableRegister"
    />
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px">
        <ElFormItem label="中文名称" prop="cname">
          <ElInput v-model="form.cname" placeholder="请输入角色中文名称" />
        </ElFormItem>
        <ElFormItem label="英文名称" prop="ename">
          <ElInput v-model="form.ename" placeholder="请输入角色英文名称" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <BaseButton @click="dialogVisible = false">取消</BaseButton>
        <BaseButton type="primary" @click="submitForm">确定</BaseButton>
      </template>
    </ElDialog>
  </ContentWrap>
</template>

<style scoped lang="less">
.mb-10px {
  margin-bottom: 10px;
}
</style>
