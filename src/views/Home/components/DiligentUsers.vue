<script setup lang="tsx">
import { ref, onMounted } from 'vue'
import { ElCard, ElAvatar, ElTag } from 'element-plus'
import { getAllAttendanceUsers } from '@/api/servers/api/user'

// 模拟数据
const mockDiligentUsers: API.UserVO[] = [
  {
    userId: '1',
    name: '张三',
    studentId: '2021001001',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    college: '计算机科学与技术学院'
  },
  {
    userId: '2',
    name: '李四',
    studentId: '2021001002',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    college: '经济管理学院'
  },
  {
    userId: '3',
    name: '王五',
    studentId: '2021001003',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    college: '物理与光电工程学院'
  }
]

const diligentUsers = ref<API.UserVO[]>(mockDiligentUsers)

onMounted(async () => {
  // 暂时使用模 拟数据，后续可以替换为真实API调用
  const res = await getAllAttendanceUsers()
  diligentUsers.value = res.data?.list || []
})
</script>

<template>
  <ElCard class="diligent-users-card">
    <template #header>
      <div class="card-header">
        <span class="font-bold">积极用户</span>
        <el-tooltip content="参与了所有未开始活动的用户" placement="top">
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
    </template>

    <div class="user-list">
      <div v-for="user in diligentUsers" :key="user.userId" class="user-item">
        <ElAvatar :src="user.avatar" :size="40" />
        <div class="user-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-detail">
            <span class="user-id">{{ user.studentId }}</span>
            <ElTag size="small" type="info" class="college-tag">{{ user.college }}</ElTag>
          </div>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped lang="less">
.diligent-users-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .user-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      .user-info {
        .user-name {
          font-weight: 500;
          font-size: 14px;
        }

        .user-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;

          .user-id {
            color: #909399;
            font-size: 12px;
          }

          .college-tag {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
