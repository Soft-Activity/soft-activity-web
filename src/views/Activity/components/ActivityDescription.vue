<script setup lang="tsx">
import { useDesign } from '@/hooks/web/useDesign'
import { PropType, reactive } from 'vue'
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'
import { activityStatus } from '@/constants/activity'
import { ContentWrap } from '@/components/ContentWrap'

defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('activity')

const schema = reactive<DescriptionsSchema[]>([
  {
    field: 'name',
    label: '活动名称'
  },
  {
    field: 'organizer',
    label: '组织者',
    width: 350
  },
  {
    field: 'category',
    label: '分类',
    width: 350
  },
  {
    field: 'location',
    label: '活动地点',
    width: 350
  },
  {
    field: 'status',
    label: '活动状态',
    slots: {
      default: (data: any) => {
        return <div>{activityStatus[data.status]}</div>
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
          <div>
            {data.startTime} - {data.endTime}
          </div>
        )
      }
    }
  },
  {
    field: 'currentCapacity',
    label: '报名情况',
    slots: {
      default: (data) => {
        return (
          <div>
            {data.capacity}/{data.maxCapacity}
          </div>
        )
      }
    }
  },
  {
    field: 'createTime',
    label: '创建时间',
    span: 24
  },
  {
    field: 'description',
    label: '活动描述',
    className: `${prefixCls}-description`,
    span: 24,
    slots: {
      default: (data: any) => {
        return <div innerHTML={data.description}></div>
      }
    }
  }
])

// 添加默认导出
defineOptions({
  name: 'ActivityDescription'
})
</script>

<template>
  <ContentWrap title="活动详情">
    <Descriptions :schema="schema" :data="currentRow || {}" :column="3" :collapse="false" />
  </ContentWrap>
</template>

<style scoped lang="less">
@prefix-cls: ~'@{namespace}-activity';
:deep(.@{prefix-cls}-label-image) {
  //background-color: #2d8cf0 !important;
  height: 100px !important;
}
:deep(.@{prefix-cls}-image) {
  //background-color: red;
}
:deep(.@{prefix-cls}-description) {
  height: 100px;
}
</style>
