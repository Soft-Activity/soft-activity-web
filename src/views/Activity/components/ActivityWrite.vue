<script setup lang="tsx">
import { PropType, reactive, ref, watch } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useValidator } from '@/hooks/web/useValidator'
import { useForm } from '@/hooks/web/useForm'
import { activityStatus } from '@/constants/activity'
import { formatToDateTime } from '@/utils/dateUtil'
import { FormItemRule } from 'element-plus'

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<Nullable<any>>,
    default: () => null
  }
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods

// 模拟用户搜索
const querySearchAsync = async (queryString: string, cb: (arg: any) => void) => {
  const mockUsers = [
    { userId: '1', name: '张三', studentId: '2021001' },
    { userId: '2', name: '李四', studentId: '2021002' },
    { userId: '3', name: '王五', studentId: '2021003' },
    { userId: '4', name: '赵六', studentId: '2021004' }
  ]

  const results = queryString
    ? mockUsers.filter((user) => {
        const lowerQuery = queryString.toLowerCase()
        return user.name.toLowerCase().includes(lowerQuery) || user.studentId.includes(queryString)
      })
    : mockUsers

  const formattedResults = results.map((user) => ({
    ...user,
    value: `${user.name} (${user.studentId})`
  }))

  setTimeout(() => {
    cb(formattedResults)
  }, 300)
}

const handleSelect = (item: Recordable) => {
  console.log('选中用户:', item)
}

// 表单配置
const schema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '活动名称',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      class: 'activity-form-item',
      placeholder: '请输入活动名称',
      maxlength: 50,
      showWordLimit: true
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'organizerId',
    label: '组织者',
    component: 'Autocomplete',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      fetchSuggestions: querySearchAsync,
      placeholder: '请输入用户名或学号进行搜索',
      triggerOnFocus: true,
      valueKey: 'value',
      clearable: true,
      on: {
        select: handleSelect
      }
    }
  },
  {
    field: 'category',
    label: '分类',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      class: 'activity-form-item',
      placeholder: '请选择活动分类',
      clearable: true
    },
    optionApi: () => {
      return [
        { label: '学术讲座', value: '1' },
        { label: '文体活动', value: '2' },
        { label: '志愿服务', value: '3' },
        { label: '社团活动', value: '4' }
      ]
    }
  },
  {
    field: 'location',
    label: '活动地点',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      class: 'activity-form-item',
      placeholder: '请输入活动地点',
      maxlength: 100,
      showWordLimit: true
    }
  },
  {
    field: 'status',
    label: '活动状态',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      class: 'activity-form-item',
      placeholder: '请选择活动状态',
      clearable: true
    },
    optionApi: () => {
      return [
        { label: '未开始', value: '0' },
        { label: '进行中', value: '1' },
        { label: '已结束', value: '2' },
        { label: '已取消', value: '3' }
      ]
    }
  },
  {
    field: 'activityTime',
    label: '活动时间',
    component: 'DatePicker',
    componentProps: {
      class: 'activity-form-item',
      type: 'datetimerange',
      startPlaceholder: '开始时间',
      endPlaceholder: '结束时间',
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm',
      clearable: true,
      on: {
        change: (dates: Date[]) => {
          setValues({
            startTime: formatToDateTime(dates[0]),
            endTime: formatToDateTime(dates[1])
          })
        }
      }
    },
    value: [props.currentRow?.startTime, props.currentRow?.endTime]
  },
  {
    field: 'maxCapacity',
    label: '最大活动人数',
    component: 'InputNumber',
    value: 0,
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      class: 'activity-form-item',
      min: 1,
      max: 1000,
      placeholder: '请输入最大活动人数',
      controls: true
    }
  },
  {
    field: 'description',
    label: '活动描述',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      class: 'activity-form-item',
      type: 'textarea',
      rows: 4,
      maxlength: 500,
      showWordLimit: true,
      placeholder: '请输入活动描述'
    },
    colProps: {
      span: 24
    }
  }
])

const rules = reactive<Record<string, FormItemRule[]>>({
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  organizer: [{ required: true, message: '请选择组织者', trigger: 'change' }],
  category: [{ required: true, message: '请选择活动分类', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  time: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  maxCapacity: [
    { required: true, message: '请输入最大活动人数', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '人数必须在1-1000之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
})

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    console.log('formData', formData)
    return formData
  } else {
    console.log('error')
  }
}

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues(currentRow)
    setSchema([])
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  submit
})
</script>

<template>
  <div class="activity-form-container">
    <Form :rules="rules" @register="formRegister" :schema="schema" class="activity-form" />
  </div>
</template>

<style lang="less" scoped>
.activity-form-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .activity-form {
    max-width: 900px;
    margin: 0 auto;

    :deep(.activity-form-item) {
      margin-bottom: 20px;

      .el-form-item__label {
        font-weight: 500;
      }

      .el-input,
      .el-select,
      .el-date-editor {
        width: 100%;
      }
    }
  }
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;

  &.status-NOT_START {
    // 未开始
    background: #e6f4ff;
    color: #1677ff;
  }

  &.status-PROCEED {
    // 进行中
    background: #f6ffed;
    color: #52c41a;
  }

  &.status-FINISHED {
    // 已结束
    background: #fff2e8;
    color: #fa8c16;
  }

  &.status-CANCELLED {
    // 已取消
    background: #fff1f0;
    color: #f5222d;
  }
}
</style>
