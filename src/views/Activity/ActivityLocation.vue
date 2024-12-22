<script setup lang="tsx">
import { reactive, ref, watch } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import { Table, TableColumn } from '@/components/Table'
import {
  ElMessage,
  ElMessageBox,
  ElTag,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElDialog
} from 'element-plus'
import { Search } from '@/components/Search'
import { BaseButton } from '@/components/Button'
import { BaiduMap } from 'vue-baidu-map-3x'
import { FormSchema } from '@/components/Form'
import { ContentWrap } from '@/components/ContentWrap'
import {
  addActivityLocation,
  deleteActivityLocation,
  getActivityLocations,
  updateActivityLocation
} from '@/api/servers/api/activityLocation'

// 表格列配置
const tableColumns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'name',
    label: '地点名称'
  },
  {
    field: 'lat',
    label: '纬度'
  },
  {
    field: 'lng',
    label: '经度'
  },
  {
    field: 'action',
    label: '操作',
    width: 160,
    slots: {
      default: (data: any) => {
        return (
          <>
            <BaseButton type="primary" onClick={() => handleEdit(data.row)}>
              编辑
            </BaseButton>
            <BaseButton type="danger" onClick={() => handleDelete(data.row)}>
              删除
            </BaseButton>
          </>
        )
      }
    }
  }
])

// 搜索表单配置
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '地点名称',
    component: 'Input'
  }
])

const isMapReady = ref(false)

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    try {
      const res = await getActivityLocations({
        current: 1,
        pageSize: 100,
        param: searchParams.value
      })
      const list = (res.data?.list ?? []).map((item) => ({
        ...item,
        lng: Number(item.lng),
        lat: Number(item.lat)
      }))
      return {
        list,
        total: res.data?.total ?? 0
      }
    } catch (error) {
      return {
        list: [],
        total: 0
      }
    }
  }
})

const { getList } = tableMethods
const { dataList, loading } = tableState

// 默认地图中心点和缩放级别
const DEFAULT_MAP_CENTER = {
  lng: 113.94250930839281,
  lat: 22.537859493830638
}
const DEFAULT_MAP_ZOOM = 18

// 地图相关配置
const mapCenter = ref<{ lng: number; lat: number }>({
  ...DEFAULT_MAP_CENTER
})
const mapZoom = ref(DEFAULT_MAP_ZOOM)

// 处理搜索
const searchParams = ref<API.ActivityLocationQuery>({})
const setSearchParams = (data: API.ActivityLocationQuery, isReset = false) => {
  searchParams.value = data
  if (isReset) {
    // 重置地图视图到默认状态
    mapCenter.value = { ...DEFAULT_MAP_CENTER }
    mapZoom.value = DEFAULT_MAP_ZOOM
    selectedMarker.value = null
    tempMarker.value = null
  }
  getList()
}

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentRow = ref<API.ActivityLocation>()

// 移除原有的 formSchema 定义，改用 reactive 定义表单数据
const formData = reactive<API.ActivityLocation>({
  name: '',
  lat: 0,
  lng: 0
})

// 添加表单验证规则
const rules = {
  name: [{ required: true, message: '请输入地点名称', trigger: 'blur' }],
  lat: [
    { required: true, message: '请输入纬度', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const num = Number(value)
        if (isNaN(num)) {
          callback(new Error('纬度必须是数字'))
        } else if (num < -90 || num > 90) {
          callback(new Error('纬度范围必须在-90到90之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  lng: [
    { required: true, message: '请输入经度', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const num = Number(value)
        if (isNaN(num)) {
          callback(new Error('经度必须是数字'))
        } else if (num < -180 || num > 180) {
          callback(new Error('经度范围必须在-180到180之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 移除原有的 useForm 相关代码
const formRef = ref()

// 修改编辑处理函数
const handleEdit = (row: API.ActivityLocation) => {
  console.log('row', row)

  currentRow.value = row
  dialogTitle.value = '编辑地点'
  dialogVisible.value = true
  console.log('dialogVisible', dialogVisible.value)
  // 直接设置表单数据
  Object.assign(formData, row)
  console.log('formData', formData)
}

// 处理删除
const handleDelete = (row: API.ActivityLocation) => {
  ElMessageBox.confirm('确认删除该地点？', '提示', {
    type: 'warning'
  }).then(async () => {
    if (!row.locationId) {
      ElMessage.error('删除失败，地点ID不存在')
      return
    }
    try {
      const res = await deleteActivityLocation({
        id: row.locationId
      })
      if (res.data) {
        ElMessage.success('删除成功')
        getList()
        updateMapCenter({
          ...DEFAULT_MAP_CENTER
        })
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 添加新增式标记
const isAddingMode = ref(false)
const tempMarker = ref<any>(null)

// 修改添加按钮处理函数
const handleAdd = () => {
  isAddingMode.value = true
  ElMessage.info('请在地图上点击选择地点位置')
}

// 修改地图点击处理函数
const handleMapClick = (e: any) => {
  const { lng, lat } = e.point

  if (isAddingMode.value) {
    dialogVisible.value = true
    isAddingMode.value = false
    console.log('地图点击事件:', e.point)
    tempMarker.value = { lng, lat }
    dialogTitle.value = '新增地点'
    // 直接设置表单数据
    Object.assign(formData, {
      locationId: undefined,
      name: '',
      lng: lng,
      lat: lat
    })
  }
}

// 修改保存处理函数
const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (valid) {
    try {
      if (dialogTitle.value === '编辑地点') {
        if (!formData.locationId) {
          ElMessage.error('地址id不能为空')
          return
        }
        // 更新
        await updateActivityLocation(
          {
            id: formData.locationId
          },
          formData
        )
        ElMessage.success('更新成功')
      } else {
        // 新增
        await addActivityLocation(formData)
        ElMessage.success('保存成功')
      }
      dialogVisible.value = false
      tempMarker.value = null
      // 更新地图视图到新保存的置
      updateMapCenter({
        ...formData,
        lng: Number(formData.lng),
        lat: Number(formData.lat)
      })

      handleDialogClose()
      // 选中新保存的标记点
      selectedMarker.value = formData
      getList()
    } catch (error) {
      ElMessage.error('保存失败')
    }
  }
}

// 修改对话框关闭处理
const handleDialogClose = () => {
  dialogVisible.value = false
  tempMarker.value = null
  isAddingMode.value = false
  formData.locationId = undefined
}

// 选中的标记点
const selectedMarker = ref<any>(null)

// 处理标记点点击
const handleMarkerClick = (marker: any) => {
  selectedMarker.value = marker
}

// 关闭信息窗口
const closeInfoWindow = () => {
  selectedMarker.value = null
}

// 信息窗口打开事件
const handleInfoWindowOpen = () => {
  console.log('信息窗口打开')
}

// 地图实例
const mapInstance = ref(null)

// 更新地图中心点和选中标记
const updateMapCenter = (item: API.ActivityLocation) => {
  mapCenter.value = {
    lng: item.lng!,
    lat: item.lat!
  }
  selectedMarker.value = item
}

const locationList = ref<API.ActivityLocation[]>([])
// 修改地图初始化函数
const handleMapReady = ({ BMap, map }: any) => {
  mapInstance.value = map
  isMapReady.value = true
  console.log('地图初始化完成')
}

// 监听 dataList 的变化
watch(
  () => dataList.value,
  (newVal) => {
    locationList.value = newVal
  },
  { immediate: true }
)

// 修改卡片点击处理函数
const handleCardClick = (item: API.ActivityLocation, e: Event) => {
  // 如果点击的是按钮，则不更新地图中心点
  if ((e.target as HTMLElement).closest('.location-actions')) {
    return
  }
  updateMapCenter(item)
}
</script>

<template>
  <ContentWrap>
    <Search
      :schema="searchSchema"
      @search="setSearchParams"
      @reset="(data) => setSearchParams(data, true)"
    />
    <div class="mb-10px">
      <BaseButton type="primary" @click="handleAdd" :disabled="isAddingMode">
        {{ isAddingMode ? '请点击地图择位置' : '新增地点' }}
      </BaseButton>
    </div>

    <div class="location-container">
      <!-- 左侧地图 -->
      <div class="map-container">
        <baidu-map
          class="map"
          :center="mapCenter"
          :zoom="mapZoom"
          :scroll-wheel-zoom="true"
          @ready="handleMapReady"
          @click="handleMapClick"
        >
          <!-- 添加地图控件 -->
          <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT" />
          <bm-scale anchor="BMAP_ANCHOR_BOTTOM_RIGHT" />

          <!-- 添加标记点 -->
          <bm-marker
            v-for="item in locationList"
            :key="item.locationId"
            :position="{ lng: Number(item.lng), lat: Number(item.lat) }"
            :dragging="false"
            @click="handleMarkerClick(item)"
          >
            <!-- 信息窗口 -->
            <bm-info-window
              :show="selectedMarker?.locationId === item.locationId"
              @close="closeInfoWindow"
              @open="handleInfoWindowOpen"
            >
              <div class="marker-info">
                <h3>{{ item.name }}</h3>
                <p>纬度：{{ item.lat }}</p>
                <p>经度：{{ item.lng }}</p>
              </div>
            </bm-info-window>
          </bm-marker>

          <!-- 临时标记点 -->
          <bm-marker
            v-if="tempMarker"
            :position="tempMarker"
            :dragging="true"
            animation="BMAP_ANIMATION_BOUNCE"
          >
            <bm-info-window :show="true">
              <div class="marker-info">
                <p>新地点位置</p>
                <p>纬度：{{ tempMarker.lat }}</p>
                <p>经度：{{ tempMarker.lng }}</p>
              </div>
            </bm-info-window>
          </bm-marker>
        </baidu-map>
      </div>

      <!-- 右侧地点列表 -->
      <div class="location-list">
        <ElCard
          v-for="item in dataList"
          :key="item.id"
          class="location-card"
          shadow="hover"
          @click="(e) => handleCardClick(item, e)"
        >
          <template #header>
            <div class="card-header">
              <span class="location-name">{{ item.name }}</span>
              <div class="location-actions">
                <BaseButton type="primary" link @click="handleEdit(item)">编辑</BaseButton>
                <BaseButton type="danger" link @click="handleDelete(item)">删除</BaseButton>
              </div>
            </div>
          </template>
          <div class="location-info">
            <div>纬度：{{ item.lat }}</div>
            <div>经度：{{ item.lng }}</div>
          </div>
        </ElCard>
      </div>
    </div>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" @close="handleDialogClose">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入名称" />
        </ElFormItem>
        <ElFormItem label="纬度" prop="lat">
          <ElInput v-model="formData.lat" placeholder="请输入纬度" />
        </ElFormItem>
        <ElFormItem label="经度" prop="lng">
          <ElInput v-model="formData.lng" placeholder="请输入经度" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <BaseButton @click="handleDialogClose">取消</BaseButton>
        <BaseButton type="primary" @click="handleSave">确定</BaseButton>
      </template>
    </ElDialog>
  </ContentWrap>
</template>

<style lang="less" scoped>
.mb-10px {
  margin-bottom: 10px;
}

.location-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 300px);
  min-height: 500px;
}

.map-container {
  flex: 2;
  border-radius: 4px;
  overflow: hidden;
}

.location-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.location-card {
  margin-bottom: 10px;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.active {
    border-color: var(--el-color-primary);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-name {
  font-weight: bold;
  font-size: 16px;
}

.location-actions {
  display: flex;
  gap: 10px;

  :deep(.el-button) {
    font-size: 14px;
    padding: 4px 8px;

    &.el-button--primary {
      color: var(--el-color-primary);

      &:hover {
        color: var(--el-color-primary-light-3);
      }
    }

    &.el-button--danger {
      color: var(--el-color-danger);

      &:hover {
        color: var(--el-color-danger-light-3);
      }
    }
  }
}

.location-info {
  color: #666;
  font-size: 14px;
}

.map {
  width: 100%;
  height: 100%;
}

.marker-info {
  padding: 10px;

  h3 {
    margin: 0 0 10px;
    font-size: 16px;
    color: #333;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
    color: #666;
  }
}
</style>
