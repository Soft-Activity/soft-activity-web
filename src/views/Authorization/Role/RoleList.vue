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
import { addRole, deleteRole, getRoles, updateRole } from '@/api/servers/api/role'
import { assignMenu } from '@/api/servers/api/menu'
import RoleMenuManage from './components/RoleMenuManage.vue'

// 模拟数据

const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const res = await getRoles({
      current: currentPage.value,
      pageSize: pageSize.value,
      param: searchParams.value
    })
    return {
      list: res.data?.list || [],
      total: res.data?.total || 0
    }
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
      default: (data: { row: API.RoleVO }) => {
        return (
          <>
            <BaseButton type="success" onClick={() => handleAssignMenu(data.row)}>
              编辑
            </BaseButton>
            <BaseButton type="info" onClick={() => handleViewMenu(data.row)}>
              查看
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

const searchParams = ref<API.RoleQuery>({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  tableMethods.getList()
}

// 弹窗表单
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = ref<API.Role>({
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

// 删除角色
const handleDelete = (roleId: number) => {
  ElMessageBox.confirm('确认删除该角色?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 模拟删除
      const res = await deleteRole({ id: roleId })
      if (res.data) {
        tableMethods.getList()
        ElMessage.success('删除成功')
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
          await updateRole({ id: form.value.roleId }, form.value)
        } else {
          // 新增
          await addRole(form.value)
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

// 添加菜单相关方法
const menuDialogVisible = ref(false)
const menuDialogTitle = ref('')
const currentRow = ref<API.RoleVO>()
const actionType = ref('')
const menuManageRef = ref<InstanceType<typeof RoleMenuManage> | null>(null)

const handleAssignMenu = (row: API.RoleVO) => {
  menuDialogTitle.value = '编辑角色'
  actionType.value = 'assign'
  currentRow.value = row
  menuDialogVisible.value = true
}

const handleViewMenu = (row: API.RoleVO) => {
  menuDialogTitle.value = '查看角色'
  actionType.value = 'view'
  currentRow.value = row
  menuDialogVisible.value = true
}

const saveMenu = async () => {
  if (actionType.value === 'assign') {
    const menuManage = unref(menuManageRef)
    const formData = await menuManage?.submit()
    if (formData) {
      try {
        // 先更新角色基本信息
        await updateRole(
          { id: formData.roleId! },
          {
            cname: formData.cname,
            ename: formData.ename
          }
        )

        // 再分配菜单
        await assignMenu({
          roleId: formData.roleId,
          menuIds: formData.menuIds
        })

        ElMessage.success('保存成功')
        menuDialogVisible.value = false
        tableMethods.getList()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    }
  }
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
    <ElDialog v-model="menuDialogVisible" :title="menuDialogTitle" width="800px" destroy-on-close>
      <RoleMenuManage
        ref="menuManageRef"
        :current-row="currentRow"
        :mode="actionType === 'assign' ? 'edit' : 'view'"
      />

      <template #footer>
        <BaseButton @click="menuDialogVisible = false">取消</BaseButton>
        <BaseButton v-if="actionType === 'assign'" type="primary" @click="saveMenu">
          确定
        </BaseButton>
      </template>
    </ElDialog>
  </ContentWrap>
</template>

<style scoped lang="less">
.mb-10px {
  margin-bottom: 10px;
}
</style>
