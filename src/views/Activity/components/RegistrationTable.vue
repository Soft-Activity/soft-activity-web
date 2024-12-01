<script setup lang="tsx">
import { Table, TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { PropType, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { BaseButton } from '@/components/Button'
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
    // const res = await getTableListApi({
    //   pageIndex: unref(currentPage),
    //   pageSize: unref(pageSize)
    // })
    const res = {
      data: {
        list: [
          {
            studentId: '2018001',
            name: '张三',
            college: '计算机与软件学院',
            phone: '12345678901',
            status: '已报名',
            createTime: '2024-11-26 11:00:00'
          },
          {
            studentId: '2018002',
            name: '李四',
            college: '计算机与软件学院',
            phone: '12345678902',
            status: '已报名',
            createTime: '2024-11-26 11:00:00'
          },
          {
            studentId: '2018003',
            name: '王五',
            college: '计算机与软件学院',
            phone: '12345678903',
            status: '已报名',
            createTime: '2024-11-26 11:00:00'
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
const { refresh, getList } = tableMethods

getList()

//表单列表设置
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
    field: 'phone',
    label: '联系方式'
  },
  {
    field: 'status',
    label: '状态'
  },
  {
    field: 'createTime',
    label: '报名时间'
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
