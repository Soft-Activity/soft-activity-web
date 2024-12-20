<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { useI18n } from '@/hooks/web/useI18n'
import { ElButton, ElInput, ElPopconfirm, ElTable, ElTableColumn, ElTag } from 'element-plus'
import AddButtonPermission from './AddButtonPermission.vue'
import { BaseButton } from '@/components/Button'
import { cloneDeep } from 'lodash-es'
import { getMenuList } from '@/api/servers/api/menu'

const { t } = useI18n()

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<API.MenuVO>,
    default: () => null
  }
})

const formSchema = reactive<FormSchema[]>([
  {
    field: 'type',
    label: '菜单类型',
    component: 'RadioButton',
    value: 0,
    colProps: {
      span: 24
    },
    componentProps: {
      options: [
        {
          label: '目录',
          value: 0
        },
        {
          label: '菜单',
          value: 1
        }
      ],
      on: {
        change: async (val: number) => {
          const formData = await getFormData()
          if (val === 1) {
            setSchema([
              {
                field: 'component',
                path: 'componentProps.disabled',
                value: false
              }
            ])
            setValues({
              component: unref(cacheComponent)
            })
          } else {
            setSchema([
              {
                field: 'component',
                path: 'componentProps.disabled',
                value: true
              }
            ])

            if (formData.parentId === void 0) {
              setValues({
                component: '#'
              })
            } else {
              setValues({
                component: '##'
              })
            }
          }
        }
      }
    }
  },
  {
    field: 'parentId',
    label: '父级菜单',
    component: 'TreeSelect',
    value: 0,
    componentProps: {
      nodeKey: 'menuId',
      props: {
        label: (data: API.MenuVO) => data.meta?.title || '',
        value: 'menuId',
        children: 'children'
      },
      defaultExpandAll: true,
      accordion: false,
      highlightCurrent: true,
      expandOnClickNode: false,
      clearable: true,
      on: {
        change: async (val: number | '') => {
          const formData = await getFormData()
          const parentId = val === '' ? 0 : val

          if (parentId && formData.type === 0) {
            setValues({
              component: '##',
              parentId
            })
          } else if (!parentId && formData.type === 0) {
            setValues({
              component: '#',
              parentId: 0
            })
          } else if (formData.type === 1) {
            setValues({
              component: unref(cacheComponent) ?? '',
              parentId
            })
          }
        }
      }
    },
    optionApi: async () => {
      const res = await getMenuList({ query: { status: 1 } })
      const list: API.MenuVO[] = (res.data || []).filter(
        (item) => item.component === 'Layout' || item.component === '#' || item.component === '##'
      )
      // 递归过滤子项
      const filteredList = filterDirectoryMenus(list)
      console.log('filteredList', filteredList)
      return filteredList
    }
  },
  {
    field: 'title',
    label: t('menu.menuName'),
    component: 'Input'
  },
  {
    field: 'icon',
    label: t('menu.icon'),
    component: 'Input'
  },
  {
    field: 'component',
    label: '组件',
    component: 'Input',
    value: '#',
    componentProps: {
      disabled: true,
      placeholder: '#为顶级目录，##为子目录',
      on: {
        change: (val: string) => {
          cacheComponent.value = val
        }
      }
    }
  },
  {
    field: 'name',
    label: t('menu.name'),
    component: 'Input'
  },
  {
    field: 'path',
    label: t('menu.path'),
    component: 'Input'
  },
  {
    field: 'activeMenu',
    label: t('menu.activeMenu'),
    component: 'Input'
  },
  {
    field: 'hidden',
    label: t('menu.hidden'),
    component: 'Switch'
  },
  {
    field: 'alwaysShow',
    label: t('menu.alwaysShow'),
    component: 'Switch'
  },
  {
    field: 'keepAlive',
    label: t('menu.noCache'),
    component: 'Switch'
  },
  {
    field: 'breadcrumb',
    label: t('menu.breadcrumb'),
    component: 'Switch'
  },
  {
    field: 'noTagsView',
    label: t('menu.noTagsView'),
    component: 'Switch'
  },
  {
    field: 'canTo',
    label: t('menu.canTo'),
    component: 'Switch'
  },
  {
    field: 'status',
    label: '状态',
    component: 'RadioButton',
    value: 1,
    componentProps: {
      options: [
        {
          label: '启用',
          value: 1
        },
        {
          label: '禁用',
          value: 0
        }
      ]
    }
  },
  {
    field: 'sortOrder',
    label: '排序',
    component: 'InputNumber',
    value: 0
  }
])

const rules = reactive({
  component: [required()],
  path: [required()],
  'meta.title': [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    return formData as API.Menu
  }
}

const cacheComponent = ref('')

// 修改表单数据类型定义
interface MenuFormData extends Omit<API.Menu, 'meta'> {
  type: number // 额外的字段：用于区分目录/菜单
  title?: string
  icon?: string
  sortOrder?: number
  hidden?: boolean
  alwaysShow?: boolean
  keepAlive?: boolean
  breadcrumb?: boolean
  activeMenu?: string
  noTagsView?: boolean
  canTo?: boolean
  status?: number
}

// 修改格式化函数
const formatMenuData = (row: API.MenuVO): MenuFormData => {
  if (!row) {
    return {} as MenuFormData
  }
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
    sortOrder: row.sortOrder || 0,
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

// 修改 watch 函数
watch(
  () => props.currentRow,
  (value) => {
    if (!value) return
    const currentRow = cloneDeep(value)

    // 使用格式化函数转换数据
    const formattedData = formatMenuData(currentRow)

    // 设置组件缓存
    cacheComponent.value = currentRow.parentId !== 0 ? currentRow?.component || '' : ''

    // 设置组件禁用状态
    setSchema([
      {
        field: 'component',
        path: 'componentProps.disabled',
        value: currentRow.parentId === 0
      }
    ])

    // 设置表单值
    setValues(formattedData)
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  submit
})

/*
const handleClose = async (tag: any) => {
  // const formData = await getFormData()
  // // 删除对应的权限
  // setValues({
  //   permissionList: formData?.permissionList?.filter((v: any) => v.value !== tag.value)
  // })
}

const handleEdit = async (row: API.MenuVO) => {
  // 深拷贝当前行数据到编辑行
  permissionEditingRow.value = { ...row }
}

const handleSave = async () => {
  const formData = await getFormData()
  const index = formData?.permissionList?.findIndex((x) => x.id === permissionEditingRow.value.id)
  if (index !== -1) {
    formData.permissionList[index] = { ...permissionEditingRow.value }
    permissionEditingRow.value = null // 重置编辑状态
  }
}

const showDrawer = ref(false)
const permissionEditingRow = ref<any>(null)

const confirm = async (data: any) => {
  const formData = await getFormData()
  setValues({
    permissionList: [...(formData?.permissionList || []), data]
  })
}
*/

// 添加递归过滤函数
const filterDirectoryMenus = (menus: API.MenuVO[]): API.MenuVO[] => {
  return menus.map((menu) => {
    const newMenu = { ...menu }
    //@ts-ignore
    if (newMenu.children && newMenu.children.length > 0) {
      // 只保留类型为目录的子项
      //@ts-ignore
      newMenu.children = newMenu.children
        .filter(
          (child) =>
            child.component === 'Layout' || child.component === '#' || child.component === '##'
        )
        .map((child) => ({ ...child }))

      // 递归处理子目录
      //@ts-ignore
      if (newMenu.children.length > 0) {
        //@ts-ignore
        newMenu.children = filterDirectoryMenus(newMenu.children)
      }
    }
    return newMenu
  })
}
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
  <!-- <AddButtonPermission v-model="showDrawer" @confirm="confirm" /> -->
</template>
