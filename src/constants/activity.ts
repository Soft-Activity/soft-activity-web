export const activityStatus: Record<string, string> = {
  NOT_START: '未开始',
  PROCEED: '进行中',
  FINISHED: '已结束',
  CANCELLED: '已取消'
}
export const activityStatusOptions = Object.entries(activityStatus).map(([key, value]) => ({
  label: value,
  value: key
}))
