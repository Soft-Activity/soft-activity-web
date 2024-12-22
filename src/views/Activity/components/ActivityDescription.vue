<script setup lang="tsx">
import { useDesign } from '@/hooks/web/useDesign'
import { computed, PropType, reactive, watch } from 'vue'
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'
import { activityStatus, mapStatus } from '@/constants/activity'
import { ContentWrap } from '@/components/ContentWrap'
import dayjs from 'dayjs'
import { formatFromDateTime, formatToDateTime } from '@/utils/dateUtil'

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('activity')
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY年MM月DD日 HH时mm分ss秒')
}

const schema = reactive<DescriptionsSchema[]>([
  {
    field: 'name',
    label: '活动名称'
  },
  {
    field: 'organizerName',
    label: '组织者',
    width: 350
  },
  {
    field: 'categoryName',
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
      default: (data) => {
        return <div>{mapStatus[data.status]}</div>
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
          <div style={{ fontSize: '14px', lineHeight: '20px', textAlign: 'center' }}>
            {formatFromDateTime(data.startTime, data.endTime)}
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
    span: 24,
    slots: {
      default: (data) => {
        return <div>{formatToDateTime(data.createTime)}</div>
      }
    }
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
const checkInSchema = reactive<DescriptionsSchema[]>([
  {
    field: 'isCheckIn',
    label: '是否需要打卡',
    slots: {
      default: (data) => {
        return <div>{data.isCheckIn ? '是' : '否'}</div>
      }
    }
  },
  {
    field: 'checkInLocationName',
    label: '打卡地点',
    width: 350,
    slots: {
      default: (data) => {
        return <div>{data.checkInLocationName}</div>
      }
    }
  },
  {
    field: 'checkInRadius',
    label: '打卡范围',
    width: 350,
    slots: {
      default: (data) => {
        return <div>{data.checkInRadius}米</div>
      }
    }
  },
  {
    field: 'checkTime',
    label: '打卡时间',
    width: 350,
    slots: {
      default: (data) => {
        return (
          <div style={{ fontSize: '14px', lineHeight: '20px', textAlign: 'center' }}>
            {formatFromDateTime(data.checkInStartTime, data.checkInEndTime)}
          </div>
        )
      }
    }
  },
  {
    field: 'currentCheckInCapacity',
    label: '打卡情况',
    slots: {
      default: (data) => {
        return (
          <div>
            {data.checkInCount}/{data.maxCapacity}
          </div>
        )
      }
    }
  }
])
watch(
  () => props.currentRow,
  async (currentRow) => {
    if (!currentRow) return
    console.log('currentRow', currentRow)
    if (currentRow.isCheckIn) {
      checkInSchema.forEach(async (item) => {
        schema.push(item)
      })
    }
  },
  {
    deep: true,
    immediate: true
  }
)
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
