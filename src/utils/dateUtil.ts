/**
 * Independent time operation tool to facilitate subsequent switch to dayjs
 */
import dayjs from 'dayjs'

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'

export function formatToDateTime(date?: dayjs.ConfigType, format = DATE_TIME_FORMAT): string {
  return dayjs(date).format(format)
}

export function formatToDate(date?: dayjs.ConfigType, format = DATE_FORMAT): string {
  return dayjs(date).format(format)
}

// 添加日期格式化函数
export const formatFromDateTime = (startTime: string, endTime: string) => {
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)

  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()

  return isSameDay
    ? dayjs(startTime).format('YYYY-MM-DD  HH:mm') + ' - ' + dayjs(endTime).format('HH:mm')
    : `${dayjs(startTime).format('YYYY-MM-DD HH:mm')} 至 ${dayjs(endTime).format('YYYY-MM-DD HH:mm')}`
}
export const dateUtil = dayjs
