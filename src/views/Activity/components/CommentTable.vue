<script setup lang="tsx">
import { Table, TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { PropType, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { BaseButton } from '@/components/Button'
import { ElRate } from 'element-plus'

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
            content: '太棒了',
            rating: 5,
            createTime: '2024-11-26 11:00:00'
          },
          {
            studentId: '2018002',
            name: '李四',
            college: '计算机与软件学院',
            content: '很好',
            rating: 4,
            createTime: '2024-11-26 11:00:00'
          },
          {
            studentId: '2018003',
            name: '王五',
            college: '计算机与软件学院',
            content: '还行',
            rating: 3,
            createTime: '2024-11-26 11:00:00'
          },
          {
            studentId: '2018004',
            name: '赵六',
            college: '计算机与软件学院',
            content: '不好',
            rating: 2,
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
    label: '评价时间'
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
