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

export const mapStatus: Record<number, string> = {
  0: '未开始',
  1: '进行中',
  2: '已结束',
  3: '已取消'
}
export const myStatusOptions = Object.entries(mapStatus).map(([key, value]) => ({
  label: value,
  value: key
}))
