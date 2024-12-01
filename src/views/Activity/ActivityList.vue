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

const { push } = useRouter()

const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    // const res = await getTableListApi({
    //   pageIndex: unref(currentPage),
    //   pageSize: unref(pageSize)
    // })
    const res = {
      data: {
        list: [
          {
            id: 1,
            name: '校园歌手大赛',
            organizer: '学生会文艺部',
            category: '文艺演出',
            location: '大学生活动中心',
            description:
              '一年一度的校园歌手大赛，展现青春风采，寻找校园音乐达人。比赛分为初赛、复赛和决赛三个阶段，欢迎所有热爱音乐的同学参与。',
            status: 'PROCEED',
            startTime: '2024-03-15 19:00:00',
            endTime: '2024-03-15 22:00:00',
            maxCapacity: 200,
            capacity: 150,
            createTime: '2024-02-20 10:00:00'
          },
          {
            id: 2,
            name: '春季运动会',
            organizer: '体育部',
            category: '体育赛事',
            location: '校运动场',
            description:
              '2024年春季校运动会，设有田径、球类等多个比赛项目，促进校园体育文化建设，增强学生体质。',
            status: 'NOT_START',
            startTime: '2024-04-12 08:00:00',
            endTime: '2024-04-13 17:00:00',
            maxCapacity: 500,
            capacity: 320,
            createTime: '2024-03-01 14:30:00'
          },
          {
            id: 3,
            name: '就业招聘会',
            organizer: '就业指导中心',
            category: '招聘会',
            location: '图书馆报告厅',
            description:
              '2024届毕业生春季专场招聘会，邀请多家知名企业现场招聘，提供上千个就业岗位，助力毕业生职业发展。',
            status: 'FINISHED',
            startTime: '2024-03-01 09:00:00',
            endTime: '2024-03-01 16:00:00',
            maxCapacity: 300,
            capacity: 280,
            createTime: '2024-02-15 09:00:00'
          },
          {
            id: 4,
            name: '编程马拉松',
            organizer: '计算机协会',
            category: '竞赛活动',
            location: '计算机楼实验室',
            description: '24小时不间断的编程挑战赛，考验团队协作和技术实力，打造创新解决方案。',
            status: 'CANCELLED',
            startTime: '2024-03-20 09:00:00',
            endTime: '2024-03-21 09:00:00',
            maxCapacity: 100,
            capacity: 60,
            createTime: '2024-02-25 16:00:00'
          }
        ],
        total: 100
      }
    }
    //模拟使用currentPage, pageSize
    console.log('currentPage', unref(currentPage))
    console.log('pageSize', unref(pageSize))
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
            {data.row.status === 'NOT_START' && (
              <BaseButton type="warning" onClick={() => action(data.row, 'edit')}>
                修改
              </BaseButton>
            )}
            {data.row.status === 'NOT_START' && (
              <BaseButton type="danger" onClick={() => delData(data.row)}>
                取消
              </BaseButton>
            )}
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
  await delList(unref(ids).length).finally(() => {
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
