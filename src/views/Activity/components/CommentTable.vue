<script setup lang="tsx">
import { Table, TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { PropType, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { BaseButton } from '@/components/Button'
import { ElMessage, ElRate } from 'element-plus'
import { getComments } from '@/api/servers/api/comment'
import { formatToDateTime } from '@/utils/dateUtil'
import qs from 'query-string'

const { activityId } = defineProps({
  activityId: {
    type: Object as PropType<any>,
    default: () => null
  }
})
const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    console.log('activityId', activityId)
    const res = await getComments({
      current: unref(currentPage),
      pageSize: unref(pageSize),
      param: { activityId: activityId }
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
const { refresh, getList } = tableMethods

getList()
//表单列表设置
const columns: TableColumn[] = [
  {
    field: 'student.studentId',
    label: '学号'
  },
  {
    field: 'student.name',
    label: '姓名'
  },
  {
    field: 'student.college',
    label: '学院'
  },
  {
    field: 'content',
    label: '内容'
  },
  {
    field: 'rating',
    label: '评分',
    slots: {
      default: (data) => {
        return <ElRate v-model={data.row.rating} disabled></ElRate>
      }
    }
  },
  {
    field: 'createTime',
    label: '评价时间',
    slots: {
      default: (data) => {
        return <div>{formatToDateTime(data.row.createTime)}</div>
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
]
loading.value = false

const exportData = () => {
  console.log('导出数据')
  console.log('props.activityId', activityId)
  if (!activityId) {
    ElMessage.error('无活动ID')
    return
  }
  try {
    window.open(
      qs.stringifyUrl({
        url: `${import.meta.env.VITE_API_BASE_PATH}/comment/export/${activityId}`
      })
    )
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}
const delData = (row: Recordable) => {
  console.log('删除数据', row)
}
</script>

<template>
  <ContentWrap title="评价列表">
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
