<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table, TableColumn } from '@/components/Table'
import { Search } from '@/components/Search'
import { reactive, ref, unref } from 'vue'
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
  ElAvatar,
  ElTag,
  ElTooltip
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addUser,
  deleteUser,
  getUsers,
  resetPassword,
  unbindWxByUserId,
  updateUser
} from '@/api/servers/api/user'
import { getRoles } from '@/api/servers/api/role'
const deleteUserId = ref<string>('')
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getUsers({
      current: currentPage.value,
      pageSize: pageSize.value,
      param: searchParams.value
    })
    return {
      list: res.data?.list || [],
      total: res.data?.total || 0
    }
  },
  fetchDelApi: async () => {
    try {
      if (!deleteUserId.value) {
        throw new Error('用户ID不存在')
      }
      const res = await deleteUser({
        id: deleteUserId.value
      })
      deleteUserId.value = ''
      return res.data
    } catch (error) {
      return false
    }
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods
getList()

// 在 columns 定义前添加
const isSuperAdmin = ref(true) // 这里应该根据实际登录用户的角色来设置

// 表格列配置
const columns: TableColumn[] = [
  {
    field: 'studentId',
    label: '学号/工号'
  },
  {
    field: 'name',
    label: '姓名'
  },

  {
    field: 'avatar',
    label: '头像',
    slots: {
      default: (data) => {
        return <ElAvatar size={50} src={data.row.avatar} />
      }
    }
  },
  {
    field: 'college',
    label: '学院/部门'
  },
  {
    field: 'gender',
    label: '性别'
  },
  {
    field: 'roles',
    label: '角色',
    slots: {
      default: (data) => {
        return <div>{data.row.roles.map((role) => role.cname).join(',') || '游客'}</div>
      }
    }
  },
  {
    field: 'setPassword',
    label: '设置密码',
    width: 100,
    slots: {
      default: (data) => {
        return data.row.setPassword ? (
          <ElTag type="success">已设置</ElTag>
        ) : (
          <ElTag type="info">未设置</ElTag>
        )
      }
    }
  },
  {
    field: 'bindWX',
    label: '微信绑定',
    width: 100,
    slots: {
      default: (data) => {
        return data.row.bindWX ? (
          <ElTag type="success">已绑定</ElTag>
        ) : (
          <ElTag type="info">未绑定</ElTag>
        )
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    fixed: 'right',
    width: 300,
    className: 'action-column',
    slots: {
      default: (data) => {
        return (
          <div class="action-buttons">
            <BaseButton type="primary" onClick={() => handleEdit(data.row)}>
              编辑
            </BaseButton>
            {isSuperAdmin.value && (
              <BaseButton type="info" onClick={() => handleSetPassword(data.row)}>
                设置密码
              </BaseButton>
            )}
            {data.row.bindWX && (
              <BaseButton type="warning" onClick={() => handleWechatBinding(data.row)}>
                解绑微信
              </BaseButton>
            )}
            <BaseButton type="danger" onClick={() => handleDelete(data.row, data.cellIndex)}>
              删除
            </BaseButton>
          </div>
        )
      }
    }
  }
]

//角色列表
const roleOptions = ref<API.RoleVO[]>([])
const getRoleOptions = async () => {
  const res = await getRoles({
    current: 1,
    pageSize: 1000,
    param: {}
  })
  roleOptions.value = res.data?.list || []
}
getRoleOptions()

// 搜索表单配置
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'studentId',
    label: '学号/工号',
    component: 'Input'
  },
  {
    field: 'name',
    label: '姓名',
    component: 'Input'
  },
  {
    field: 'college',
    label: '学院/部门',
    component: 'Input'
  },
  {
    field: 'roleId',
    label: '角色',
    component: 'Select',
    componentProps: {
      options: roleOptions,
      valueKey: 'roleId',
      props: {
        label: 'cname',
        value: 'roleId'
      }
    }
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
const form = ref<API.UserCreateParm>({})
const password = ref('')

const rules = reactive<FormRules>({
  studentId: [{ required: true, message: '请输入学号/工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  college: [{ required: true, message: '请输入学院/部门', trigger: 'blur' }],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    },
    {
      min: 6,
      message: '密码长度不能小于6位',
      trigger: 'blur'
    }
  ]
})

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
  form.value = {
    studentId: '',
    name: '',
    college: '',
    avatar: '',
    gender: '',
    roleIds: []
  }
}

// 编辑
const handleEdit = (row: API.UserVO) => {
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
  // 转换角色数据格式
  const roleIds = (row.roles?.map((role) => role.roleId) as number[]) || []
  form.value = {
    ...row,
    roleIds: roleIds // 只保存角色ID数组
  }
}

// 删除
const handleDelete = async (row: API.UserVO, cellIndex: number) => {
  console.log('cellIndex', cellIndex)
  if (!row.userId) {
    ElMessage.error('用户ID不存在')
    return
  }
  deleteUserId.value = row.userId
  await tableMethods.delList(cellIndex)
}

// 提交表单
const submitForm = () => {
  //@ts-ignore
  form.value.password = password.value
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      // 模拟提交
      if (form.value.userId) {
        // 编辑
        const res = await updateUser(
          {
            id: form.value.userId
          },
          form.value
        )
        ElMessage.success('编辑成功')
        if (password.value) {
          await resetPassword({
            userId: form.value.userId,
            newPassword: password.value
          })
        } else {
          throw new Error(res.message)
        }
        ElMessage.success('编辑成功')
      } else {
        // 新增
        await addUser(form.value)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.log('error', error)
      //@ts-ignore
      ElMessage.error(error?.response?.data?.message || '操作失败')
    }
  })
}

// 添加微信解绑处理函数
const handleWechatBinding = (row: API.UserVO) => {
  if (row.bindWX) {
    // 解绑确认
    ElMessageBox.confirm('确认解除该用户的微信绑定?', '提示', {
      type: 'warning'
    }).then(async () => {
      try {
        if (!row.userId) {
          ElMessage.error('用户ID不存在')
          return
        }
        await unbindWxByUserId({ userId: row.userId })
        ElMessage.success('解绑成功')
        getList()
      } catch {
        ElMessage.error('解绑失败')
      }
    })
  }
}

// 添加设置密码的处理函数
const handleSetPassword = (row: API.UserVO) => {
  dialogTitle.value = '设置密码'
  dialogVisible.value = true
  form.value = {
    ...row
  }
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <BaseButton type="primary" @click="handleAdd">新增用户</BaseButton>
    </div>

    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :loading="loading"
      :data="dataList"
      row-key="userId"
      :pagination="{
        total: total
      }"
      :columns="columns"
      @register="tableRegister"
    />

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <template v-if="dialogTitle !== '设置密码'">
          <ElFormItem label="学号/工号" prop="userId">
            <ElInput v-model="form.studentId" placeholder="请输入学号/工号" />
          </ElFormItem>
          <ElFormItem label="姓名" prop="name">
            <ElInput v-model="form.name" placeholder="请输入姓名" />
          </ElFormItem>
          <ElFormItem label="学院/部门" prop="college">
            <ElInput v-model="form.college" placeholder="请输入学院/部门" />
          </ElFormItem>
          <ElFormItem label="性别" prop="gender">
            <ElSelect v-model="form.gender" placeholder="请选择性别">
              <ElOption label="男" value="男" />
              <ElOption label="女" value="女" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="角色" prop="roleIds">
            <ElSelect v-model="form.roleIds" multiple placeholder="请选择角色">
              <ElOption
                v-for="role in roleOptions"
                :key="role.roleId"
                :label="role.cname"
                :value="role?.roleId || ''"
              />
            </ElSelect>
          </ElFormItem>
        </template>
        <ElFormItem v-if="dialogTitle === '设置密码'" label="密码" prop="password">
          <ElInput v-model="password" type="password" placeholder="请输入密码" show-password />
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

:deep(.action-column) {
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .el-button {
      margin-left: 0;
    }
  }
}
</style>
