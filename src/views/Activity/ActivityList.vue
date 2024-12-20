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
import { activityStatus, activityStatusOptions } from '@/constants/activity'
import { ElTag, ElProgress } from 'element-plus'
import { getActivitys, deleteActivity } from '@/api/servers/api/activity'

const { push } = useRouter()

const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getActivitys({
      current: unref(currentPage),
      pageSize: unref(pageSize),
      param: {}
    })

    // 将API返回的数据结构映射到前端展示需要的结构
    const mappedList = (res.data.list ?? []).map((item) => ({
      id: item.activityId,
      name: item.name,
      organizer: item.organizerName,
      category: item.categoryName,
      location: item.location,
      description: item.description,
      status: mapStatus(Number(item.status) || 0), // 确保status是number类型
      startTime: item.startTime,
      endTime: item.endTime,
      maxCapacity: Number(item.maxCapacity), // 确保maxCapacity是number类型
      capacity: Number(item.capacity), // 确保capacity是number类型
      createTime: item.createTime,
      avgRating: Number(item.avgRating), // 确保avgRating是number类型
      commentCount: Number(item.commentCount), // 确保commentCount是number类型
      recentComments: item.recentComments
    }))

    return {
      list: mappedList,
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
    field: 'organizer',
    label: '组织者',
    width: 100
  },
  {
    field: 'category',
    label: '分类',
    width: 100,
    slots: {
      default: (data) => {
        return <ElTag size="small">{data.row.category}</ElTag>
      }
    }
  },
  {
    field: 'description',
    label: '活动描述',
    width: 200,
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
          NOT_START: 'info',
          PROCEED: 'success',
          FINISHED: 'warning',
          CANCELLED: 'danger'
        }
        return (
          <ElTag type={statusMap[data.row.status]} effect="light">
            {activityStatus[data.row.status]}
          </ElTag>
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
            {data.row.startTime} 至 {data.row.endTime}
          </div>
        )
      }
    }
  },
  {
    field: 'currentCapacity',
    label: '报名情况',
    width: 180,
    slots: {
      default: (data) => {
        const percentage = (data.row.capacity / data.row.maxCapacity) * 100
        return (
          <div class="flex items-center">
            <ElProgress
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
              取消
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
    field: 'organizer',
    label: '组织者',
    component: 'Input',
    colProps: {
      span: 8
    }
  },
  {
    field: 'category',
    label: '分类',
    component: 'Input',
    colProps: {
      span: 8
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
      options: activityStatusOptions
    }
  },
  {
    field: 'startTime',
    label: '活动开始时间',
    component: 'DatePicker',
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
    }
  }
])
//查询参数
const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}
const ids = ref<string[]>([])

//增删改查按钮
const AddAction = () => {
  push('/activity/add')
}
const delLoading = ref(false)
const delData = async (row: any | null) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row ? [row.id] : elTableExpose?.getSelectionRows().map((v: any) => v.id) || []
  delLoading.value = true
  await deleteActivity({ id: unref(ids)[0] }).finally(() => {
    delLoading.value = false
  })
}
const action = (row: any, type: 'edit' | 'detail') => {
  push({
    path: `/activity/${type}`,
    query: {
      id: row.id
    }
  })
}

// 添加状态映射函数
const mapStatus = (status: number): string => {
  const statusMap = {
    0: 'NOT_START',
    1: 'PROCEED',
    2: 'FINISHED',
    3: 'CANCELLED'
  }
  return statusMap[status] || 'NOT_START'
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
