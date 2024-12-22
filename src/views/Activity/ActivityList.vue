<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table, TableColumn } from '@/components/Table'
import { Search } from '@/components/Search'
import { reactive, ref, unref } from 'vue'
import { BaseButton } from '@/components/Button'
import { useTable } from '@/hooks/web/useTable'
import { FormSchema } from '@/components/Form'
import { useEmitt } from '@/hooks/event/useEmitt'
import { useRouter } from 'vue-router'
import { mapStatus, myStatusOptions } from '@/constants/activity'
import { ElTag, ElProgress, ElMessageBox, ElMessage, dayjs } from 'element-plus'
import { getActivitys, deleteActivity } from '@/api/servers/api/activity'
import { getActivityCategorys } from '@/api/servers/api/activityCategory'
import { number } from 'vue-types'
import { formatFromDateTime } from '@/utils/dateUtil'
const { push } = useRouter()

const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getActivitys({
      current: unref(currentPage),
      pageSize: unref(pageSize),
      param: unref(searchParams)
    })

    // // 将API返回的数据结构映射到前端展示需要的结构
    // const mappedList = (res.data.list ?? []).map((item) => ({
    //   id: item.activityId,
    //   name: item.name,
    //   organizer: item.organizerName,
    //   category: item.categoryName,
    //   location: item.location,
    //   description: item.description,
    //   status: mapStatus(Number(item.status) || 0), // 确保status是number类型
    //   startTime: item.startTime,
    //   endTime: item.endTime,
    //   maxCapacity: Number(item.maxCapacity), // 确保maxCapacity是number类型
    //   capacity: Number(item.capacity), // 确保capacity是number类型
    //   createTime: item.createTime,
    //   avgRating: Number(item.avgRating), // 确保avgRating是number类型
    //   commentCount: Number(item.commentCount), // 确保commentCount是number类型
    //   recentComments: item.recentComments
    // }))

    return {
      list: res.data.list ?? [],
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    return true
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { refresh, getList, getElTableExpose, delList } = tableMethods

getList()

useEmitt({
  name: 'getList',
  callback: (type: string) => {
    if (type === 'add') {
      currentPage.value = 1
    }
    getList()
  }
})

//表单列表设置
const columns: TableColumn[] = [
  {
    field: 'name',
    label: '活动名称',
    slots: {
      default: (data) => {
        return (
          <span
            class="font-medium text-blue-600 cursor-pointer"
            onClick={() => action(data.row, 'detail')}
          >
            {data.row.name}
          </span>
        )
      }
    }
  },
  {
    field: 'organizerName',
    label: '组织者',
    width: 100
  },
  {
    field: 'category',
    label: '分类',
    width: 100,
    slots: {
      default: (data) => {
        return <ElTag size="small">{data.row.categoryName}</ElTag>
      }
    }
  },
  {
    field: 'description',
    label: '活动描述',
    width: 120,
    showOverflowTooltip: true
  },
  {
    field: 'location',
    label: '活动地点',
    width: 120
  },
  {
    field: 'status',
    label: '活动状态',
    width: 100,
    slots: {
      default: (data) => {
        const statusMap = {
          0: 'info',
          1: 'success',
          2: 'warning',
          3: 'danger'
        }
        return (
          <ElTag type={statusMap[data.row.status]} effect="light">
            {mapStatus[data.row.status]}
          </ElTag>
        )
      }
    }
  },
  {
    field: 'isCheckIn',
    label: '签到',
    width: 100,
    slots: {
      default: (data) => {
        return (
          <ElTag type={data.row.isCheckIn ? 'success' : 'info'} effect="light">
            {data.row.isCheckIn ? '是' : '否'}
          </ElTag>
        )
      }
    }
  },
  {
    field: 'currentCapacity',
    label: '报名情况',
    width: 120,
    slots: {
      default: (data) => {
        const percentage = (data.row.capacity / data.row.maxCapacity) * 100
        return (
          <div class="flex items-center">
            <ElProgress
              class="w-full"
              percentage={percentage}
              format={() => `${data.row.capacity}/${data.row.maxCapacity}`}
              stroke-width={10}
            />
          </div>
        )
      }
    }
  },
  {
    field: 'activityTime',
    label: '活动时间',
    width: 350,
    slots: {
      default: (data) => {
        return (
          <div class="text-gray-600">
            <i class="el-icon-time mr-1"></i>
            {formatFromDateTime(data.row.startTime, data.row.endTime)}
          </div>
        )
      }
    }
  },

  {
    field: 'createTime',
    label: '创建时间',
    width: 180
  },
  {
    field: 'action',
    label: '操作',
    showOverflowTooltip: false,
    fixed: 'right',
    width: 300,
    slots: {
      default: (data) => {
        return (
          <div class="flex gap-2">
            <BaseButton type="primary" onClick={() => action(data.row, 'detail')}>
              详细
            </BaseButton>
            <BaseButton type="warning" onClick={() => action(data.row, 'edit')}>
              修改
            </BaseButton>
            <BaseButton type="danger" onClick={() => delData(data.row)}>
              删除
            </BaseButton>
          </div>
        )
      }
    }
  }
]
loading.value = false
//查询列表设置
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '活动名称',
    component: 'Input',
    colProps: {
      span: 8
    }
  },
  {
    field: 'organizerName',
    label: '组织者',
    component: 'Input',
    colProps: {
      span: 8
    }
  },
  {
    field: 'categoryId',
    label: '分类',
    component: 'Select',
    componentProps: {
      class: 'activity-form-item',
      placeholder: '请选择活动分类',
      clearable: true
    },
    optionApi: async () => {
      try {
        const { data } = await getActivityCategorys({
          current: 1,
          pageSize: 20,
          param: {}
        })
        return (data?.list ?? []).map((item) => ({
          label: item.name,
          value: item.categoryId
        }))
      } catch (error) {
        console.error('获取活动分类失败:', error)
        return []
      }
    }
  },
  {
    field: 'status',
    label: '活动状态',
    component: 'Select',
    colProps: {
      span: 8
    },
    componentProps: {
      options: myStatusOptions,
      placeholder: '请选择活动状态'
    }
  },
  {
    field: 'isCheckIn',
    label: '是否需要签到',
    component: 'Switch',
    colProps: {
      span: 8
    },
    componentProps: {
      activeText: '是',
      inactiveText: '否'
    }
  },
  {
    field: 'startTime',
    label: '活动开始时间',
    component: 'DatePicker',
    componentProps: {
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    },
    colProps: {
      span: 8
    }
  },
  {
    field: 'endTime',
    label: '活动结束时间',
    component: 'DatePicker',
    colProps: {
      span: 8
    },
    componentProps: {
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
])
//查询参数
const searchParams = ref({})
const setSearchParams = (params: any) => {
  ;(searchParams.value = params), (currentPage.value = 1), getList()
}

//增删改查按钮
const AddAction = () => {
  push('/activity/add')
}
const delLoading = ref(false)
const delData = async (row: API.ActivityVO | null) => {
  try {
    await ElMessageBox.confirm('确认要删除该活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (!row?.activityId) {
      ElMessage.error('请选择要删除的活动')
      return
    }

    await deleteActivity({ id: Number(row.activityId) })

    ElMessage.success('活动删除成功')
    await getList()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('操作失败')
  } finally {
    delLoading.value = false
  }
}
const action = (row: any, type: 'edit' | 'detail') => {
  push({
    path: `/activity/${type}`,
    query: {
      id: row.activityId
    }
  })
}
</script>

<template>
  <ContentWrap title="活动列表">
    <Search :schema="searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-4">
      <BaseButton type="primary" size="large" @click="AddAction">
        <template #icon>
          <el-icon><Plus /></el-icon>
        </template>
        新增活动
      </BaseButton>
    </div>

    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      showAction
      showPagination
      :columns="columns"
      row-key="id"
      :data="dataList"
      :loading="loading"
      @register="tableRegister"
      @refresh="refresh"
      :pagination="{
        total: total
      }"
      align="center"
      headerAlign="center"
      class="activity-table"
      :row-class-name="() => 'hover:bg-blue-50 transition-colors duration-200'"
    />
  </ContentWrap>
</template>
@/hooks/event/useEmitt
