<script setup lang="tsx">
import { PropType, ref } from 'vue'
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'
import { Icon } from '@/components/Icon'
import { ElTag } from 'element-plus'

// 复用 Write.vue 中的 MenuFormData 接口
interface MenuFormData extends Omit<API.Menu, 'meta'> {
  type: number
  title?: string
  icon?: string
  hidden?: boolean
  alwaysShow?: boolean
  keepAlive?: boolean
  breadcrumb?: boolean
  activeMenu?: string
  noTagsView?: boolean
  canTo?: boolean
  status?: number
}

// 格式化数据函数
const formatMenuData = (row: API.MenuVO): MenuFormData => {
  if (!row) {
    return {} as MenuFormData
  }
  console.log('row', row)
  return {
    menuId: row.menuId,
    parentId: row.parentId || 0,
    name: row.name || '',
    path: row.path || '',
    component: row.component || '',
    redirect: row.redirect,
    type: row.parentId === 0 ? 0 : 1,
    title: row.meta?.title || '',
    icon: row.meta?.icon,
    hidden: row.meta?.hidden || false,
    alwaysShow: row.meta?.alwaysShow || false,
    keepAlive: row.meta?.noCache || false,
    breadcrumb: row.meta?.breadcrumb ?? true,
    activeMenu: row.meta?.activeMenu,
    noTagsView: row.meta?.noTagsView || false,
    canTo: row.meta?.canTo || false,
    status: row.status ?? 1,
    sortOrder: row.sortOrder || 0
  }
}

const props = defineProps({
  currentRow: {
    type: Object as PropType<API.MenuVO>,
    default: () => undefined
  }
})

const renderTag = (enable?: boolean) => {
  return <ElTag type={!enable ? 'danger' : 'success'}>{enable ? '启用' : '禁用'}</ElTag>
}

const detailSchema = ref<DescriptionsSchema[]>([
  {
    field: 'type',
    label: '菜单类型',
    span: 24,
    slots: {
      default: (data) => {
        return <>{data.type === 0 ? '目录' : '菜单'}</>
      }
    }
  },
  {
    field: 'title',
    label: '菜单名称'
  },
  {
    field: 'component',
    label: '组件',
    slots: {
      default: (data) => {
        const component = data.component
        return <>{component === '#' ? '顶级目录' : component === '##' ? '子目录' : component}</>
      }
    }
  },
  {
    field: 'name',
    label: '组件名称'
  },
  {
    field: 'icon',
    label: '图标',
    slots: {
      default: (data) => {
        const icon = data.icon
        if (icon) {
          return <Icon icon={icon} />
        }
        return null
      }
    }
  },
  {
    field: 'path',
    label: '路径'
  },
  {
    field: 'activeMenu',
    label: '高亮菜单'
  },
  {
    field: 'status',
    label: '菜单状态',
    slots: {
      default: (data) => {
        return renderTag(data.status === 1)
      }
    }
  },
  {
    field: 'hidden',
    label: '是否隐藏',
    slots: {
      default: (data) => {
        return renderTag(data.hidden)
      }
    }
  },
  {
    field: 'alwaysShow',
    label: '是否一直显示',
    slots: {
      default: (data) => {
        return renderTag(data.alwaysShow)
      }
    }
  },
  {
    field: 'keepAlive',
    label: '是否清除缓存',
    slots: {
      default: (data) => {
        return renderTag(data.keepAlive)
      }
    }
  },
  {
    field: 'breadcrumb',
    label: '是否显示面包屑',
    slots: {
      default: (data) => {
        return renderTag(data.breadcrumb)
      }
    }
  },
  {
    field: 'noTagsView',
    label: '是否隐藏标签页',
    slots: {
      default: (data) => {
        return renderTag(data.noTagsView)
      }
    }
  },
  {
    field: 'canTo',
    label: '是否可跳转',
    slots: {
      default: (data) => {
        return renderTag(data.canTo)
      }
    }
  },
  {
    field: 'sortOrder',
    label: '排序'
  }
])
</script>

<template>
  <Descriptions :schema="detailSchema" :data="formatMenuData(currentRow || {})" />
</template>
