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

interface UserForm {
  userId: string
  name: string
  college: string
  avatar: string
  gender: string
  roles: any[]
  openId?: string
  password?: string
  showPassword?: boolean
}

// 模拟数据
const mockUsers = [
  {
    userId: '2021001',
    name: '张三',
    college: '计算机学院',
    avatar: 'https://example.com/avatar1.jpg',
    gender: '男',
    roles: [{ roleId: 1, cname: '学生', ename: 'STUDENT' }],
    openId: 'wx123456'
  },
  {
    userId: '2021002',
    name: '李四',
    college: '信息工程学院',
    avatar: 'https://example.com/avatar2.jpg',
    gender: '女',
    roles: [{ roleId: 2, cname: '教师', ename: 'TEACHER' }],
    password: '123456'
  },
  {
    userId: '2021003',
    name: '王五',
    college: '机械工程学院',
    avatar: 'https://example.com/avatar3.jpg',
    gender: '男',
    roles: [{ roleId: 1, cname: '学生', ename: 'STUDENT' }]
  },
  {
    userId: '2021004',
    name: '赵六',
    college: '电子信息学院',
    avatar: 'https://example.com/avatar4.jpg',
    gender: '女',
    roles: [{ roleId: 1, cname: '学生', ename: 'STUDENT' }],
    openId: 'wx789012'
  }
]

// 模拟角色数据
const roleOptions = [
  { roleId: 1, cname: '学生', ename: 'STUDENT' },
  { roleId: 2, cname: '教师', ename: 'TEACHER' },
  { roleId: 3, cname: '管理员', ename: 'ADMIN' }
]

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    // 模拟接口
    return {
      list: mockUsers,
      total: mockUsers.length
    }
  },
  fetchDelApi: async () => {
    return true
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
    field: 'userId',
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
        return <div>{data.row.roles.map((role) => role.cname).join(',')}</div>
      }
    }
  },
  {
    field: 'openId',
    label: '微信绑定',
    width: 100,
    slots: {
      default: (data) => {
        return data.row.openId ? (
          <ElTag type="success">已绑定</ElTag>
        ) : (
          <ElTag type="info">未绑定</ElTag>
        )
      }
    }
  },
  {
    field: 'password',
    label: '密码',
    width: 100,
    show: isSuperAdmin,
    slots: {
      default: (data) => {
        return data.row.password ? (
          <ElTooltip
            content={data.row.showPassword ? data.row.password : '点击查看密码'}
            placement="top"
          >
            <BaseButton
              type="info"
              link
              onClick={() => (data.row.showPassword = !data.row.showPassword)}
            >
              {data.row.showPassword ? data.row.password : '******'}
            </BaseButton>
          </ElTooltip>
        ) : (
          <span>未设置</span>
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
            {data.row.openId && (
              <BaseButton type="warning" onClick={() => handleWechatBinding(data.row)}>
                解绑微信
              </BaseButton>
            )}
            <BaseButton type="danger" onClick={() => handleDelete(data.row)}>
              删除
            </BaseButton>
          </div>
        )
      }
    }
  }
]

// 搜索表单配置
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'userId',
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
    field: 'role',
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
const form = ref<UserForm>({
  userId: '',
  name: '',
  college: '',
  avatar: '',
  gender: '',
  roles: []
})

const rules = reactive<FormRules>({
  userId: [{ required: true, message: '请输入学号/工号', trigger: 'blur' }],
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
    userId: '',
    name: '',
    college: '',
    avatar: '',
    gender: '',
    roles: []
  }
}

// 编辑
const handleEdit = (row: UserForm) => {
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
  // 转换角色数据格式
  const roles = row.roles.map((role) => role.roleId)
  form.value = {
    ...row,
    roles: roles // 只保存角色ID数组
  }
}

// 删除
const handleDelete = async (row: UserForm) => {
  await tableMethods.delList(1)
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      // 模拟提交
      if (form.value.userId) {
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

// 添加微信解绑处理函数
const handleWechatBinding = (row: UserForm) => {
  if (row.openId) {
    // 解绑确认
    ElMessageBox.confirm('确认解除该用户的微信绑定?', '提示', {
      type: 'warning'
    }).then(async () => {
      try {
        // TODO: 调用解绑 API
        ElMessage.success('解绑成功')
        getList()
      } catch {
        ElMessage.error('解绑失败')
      }
    })
  }
}

// 添加设置密码的处理函数
const handleSetPassword = (row: UserForm) => {
  dialogTitle.value = '设置密码'
  dialogVisible.value = true
  form.value = {
    ...row,
    password: '' // 清空密码字段
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
            <ElInput v-model="form.userId" placeholder="请输入学号/工号" />
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
          <ElFormItem label="角色" prop="roles">
            <ElSelect v-model="form.roles" multiple placeholder="请选择角色">
              <ElOption
                v-for="role in roleOptions"
                :key="role.roleId"
                :label="role.cname"
                :value="role.roleId"
              />
            </ElSelect>
          </ElFormItem>
        </template>
        <ElFormItem
          v-if="dialogTitle === '新增用户' || dialogTitle === '设置密码'"
          label="密码"
          prop="password"
        >
          <ElInput v-model="form.password" type="password" placeholder="请输入密码" show-password />
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
