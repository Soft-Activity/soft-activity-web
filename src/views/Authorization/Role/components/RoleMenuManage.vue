<script setup lang="tsx">
import { PropType, ref, unref, nextTick, reactive } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { ElTree, ElCheckboxGroup, ElCheckbox, ElInput, ElSelect, ElOption } from 'element-plus'
import { eachTree, filter } from '@/utils/tree'
import { getMenuList, getRoleMenus } from '@/api/servers/api/menu'

const props = defineProps({
  currentRow: {
    type: Object as PropType<API.RoleVO>,
    default: () => null
  },
  mode: {
    type: String as PropType<'view' | 'edit'>,
    default: 'view'
  }
})

const treeRef = ref<InstanceType<typeof ElTree> | null>(null)
const currentTreeData = ref<API.MenuVO>()
const roleMenu = ref<API.MenuVO[]>([])
const treeData = ref<API.MenuVO[]>([])

// 表单数据
const formData = ref({
  cname: props.currentRow?.cname || '',
  ename: props.currentRow?.ename || ''
})

const formSchema = reactive<FormSchema[]>([
  {
    field: 'cname',
    label: '角色中文名称',
    component: 'Input',
    componentProps: {
      disabled: props.mode === 'view'
    },
    value: props.currentRow?.cname
  },
  {
    field: 'ename',
    label: '角色英文名称',
    component: 'Input',
    componentProps: {
      disabled: props.mode === 'view'
    },
    value: props.currentRow?.ename
  },
  {
    field: 'menu',
    label: props.mode === 'edit' ? '编辑菜单' : '查看菜单',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <div class="flex w-full min-h-[400px]">
              <div class="flex-1 border p-4">
                <ElTree
                  ref={treeRef}
                  show-checkbox={props.mode === 'edit'}
                  node-key="menuId"
                  props={{ children: 'children', label: (data) => data.data?.meta?.title }}
                  highlight-current
                  check-on-click-node={props.mode === 'edit'}
                  expand-on-click-node={false}
                  data={treeData.value}
                  onNode-click={handleNodeClick}
                >
                  {{
                    default: (data: { data: API.MenuVO }) => {
                      return <span>{data.data.meta?.title}</span>
                    }
                  }}
                </ElTree>
              </div>
              {/* <div class="flex-1 border-l p-4">
                {unref(currentTreeData)?.meta?.permission && (
                  <ElCheckboxGroup
                    modelValue={currentTreeData.value?.meta?.permission}
                    disabled={props.mode === 'view'}
                    onUpdate:modelValue={(val) => {
                      if (currentTreeData.value?.meta) {
                        currentTreeData.value.meta.permission = val as string[]
                      }
                    }}
                  >
                    {currentTreeData.value?.meta?.permission?.map((item) => (
                      <ElCheckbox key={item} label={item}>
                        {item}
                      </ElCheckbox>
                    ))}
                  </ElCheckboxGroup>
                )}
              </div> */}
            </div>
          )
        }
      }
    }
  }
])

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

const handleNodeClick = (data: API.MenuVO) => {
  if (!treeRef.value || props.mode !== 'edit') return
}

const fetchMenuList = async () => {
  try {
    const [res, roleMenuRes] = await Promise.all([
      getMenuList({
        query: {
          status: 1
        }
      }),
      getRoleMenus({ roleId: props.currentRow.roleId! })
    ])

    if (res?.data && roleMenuRes?.data && props.mode === 'edit') {
      treeData.value = Array.isArray(res.data) ? res.data : []
      roleMenu.value = Array.isArray(roleMenuRes.data) ? roleMenuRes.data : []
      await initTreeChecked()
    } else {
      treeData.value = Array.isArray(roleMenuRes.data) ? roleMenuRes.data : []
    }
  } catch (error) {
    console.error('获取菜单失败:', error)
  }
}

const initTreeChecked = async () => {
  if (!props.currentRow) return
  await nextTick()
  const checked: number[] = []
  eachTree(roleMenu.value, (v) => {
    checked.push(v.menuId!)
  })
  for (const item of checked) {
    treeRef.value?.setChecked(item, true, false)
  }
}

const submit = async () => {
  if (props.mode === 'view') return

  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    // const data = filter(unref(treeData), (item: API.MenuVO) => {
    //   return checkedKeys.includes(item.menuId!)
    // })

    console.log('checkeys', checkedKeys)
    // console.log('data', data)
    // console.log('unref(treeData)', unref(treeData))

    // 返回完整的角色信息
    return {
      roleId: props.currentRow?.roleId,
      cname: formData.cname,
      ename: formData.ename,
      menuIds: checkedKeys as number[]
    }
  }
}

defineExpose({
  submit
})

fetchMenuList()
</script>

<template>
  <Form @register="formRegister" :schema="formSchema" />
</template>

<style scoped>
.border {
  border: 1px solid #dcdfe6;
}
.border-l {
  border-left: 1px solid #dcdfe6;
}
</style>
