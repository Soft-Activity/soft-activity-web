<script setup lang="tsx">
import { Table, TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { PropType, ref, unref, watch } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { BaseButton } from '@/components/Button'
import { getRegistrations } from '@/api/servers/api/registration'
import dayjs from 'dayjs'
import qs from 'query-string'
import { ElMessage } from 'element-plus'

const props = defineProps({
  activityId: {
    type: Object as PropType<any>,
    default: () => null
  },
  isCheckIn: {
    type: Boolean,
    default: false
  }
})
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}
const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    console.log('activityId', props.activityId)
    const res = await getRegistrations({
      current: unref(currentPage),
      pageSize: unref(pageSize),
      param: { activityId: props.activityId, status: 0 }
    })
    return {
      list: res.data?.list ?? [],
      total: res.data?.total ?? 0
    }
  },
  fetchDelApi: async () => {
    return true
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { refresh, getList, delColumn } = tableMethods

getList()

//表单列表设置
const columns = ref<TableColumn[]>([
  {
    field: 'schoolId',
    label: '学号'
  },
  {
    field: 'userName',
    label: '姓名'
  },
  {
    field: 'collegeName',
    label: '学院'
  },
  // {
  //   field: 'status',
  //   label: '状态',
  //   formatter: (row) => {
  //     const statusMap = {
  //       0: '已报名',
  //       1: '已取消'
  //     }
  //     return statusMap[row.status] || '未知状态'
  //   }
  // },
  {
    field: 'isCheckIn',
    label: '打卡状态',
    hidden: !props.isCheckIn,
    slots: {
      default: (data) => {
        return <div>{data.row.isCheckIn ? '已打卡' : '未打卡'}</div>
      }
    }
  },
  {
    field: 'createTime',
    label: '报名时间',
    slots: {
      default: (data) => {
        return <div>{formatTime(data.row.createTime)}</div>
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    slots: {
      default: (data) => {
        return (
          <div>
            <BaseButton type="danger" onClick={() => delData(data.row)}>
              删除
            </BaseButton>
          </div>
        )
      }
    }
  }
])
loading.value = false
const exportData = () => {
  console.log('props.activityId', props.activityId)
  if (!props.activityId) {
    ElMessage.error('无活动ID')
    return
  }
  try {
    window.open(
      qs.stringifyUrl({
        url: `${import.meta.env.VITE_API_BASE_PATH}/registration/export/${props.activityId}`
      })
    )
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}
const delData = (row: any) => {
  console.log('删除数据', row)
}
</script>

<template>
  <ContentWrap title="报名列表">
    <div class="mb-10px mr-10px flex justify-self-end">
      <BaseButton type="primary" size="large" @click="exportData">导出</BaseButton>
    </div>
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
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
    />
  </ContentWrap>
</template>

<style scoped lang="less"></style>
