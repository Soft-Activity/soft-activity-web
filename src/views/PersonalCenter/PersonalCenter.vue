<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ref, unref } from 'vue'
import { ElDivider, ElImage, ElTag, ElTabPane, ElTabs, ElButton, ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/imgs/avatar.jpg'
import UploadAvatar from './components/UploadAvatar.vue'
import { Dialog } from '@/components/Dialog'
import EditStudentInfo from './components/EditStudentInfo.vue'
import EditPassword from './components/EditPassword.vue'
import EditInfo from './components/EditInfo.vue'
import { getCurrentUser } from '@/api/servers/api/user'
import { getStudent } from '@/api/servers/api/student'

const userInfo = ref<API.UserVO>({})
const studentInfo = ref<API.StudentVO>({})
const fetchDetailUserApi = async () => {
  // 这里可以调用接口获取用户信息
  const data = await getCurrentUser()
  console.log(data)
  userInfo.value = data.data
  if (userInfo.value?.studentId) {
    const studentData = await getStudent({ id: userInfo.value.studentId })
    studentInfo.value = studentData.data
  } else {
    studentInfo.value = {}
  }
}
fetchDetailUserApi()

const activeName = ref<string>('first')

const dialogVisible = ref(false)

const uploadAvatarRef = ref<ComponentRef<typeof UploadAvatar>>()
const avatarLoading = ref(false)
const saveAvatar = async () => {
  try {
    avatarLoading.value = true
    const base64 = unref(uploadAvatarRef)?.getBase64()
    console.log(base64)
    // 这里可以调用修改头像接口
    fetchDetailUserApi()
    ElMessage.success('修改成功')
    dialogVisible.value = false
  } catch (error) {
    console.log(error)
  } finally {
    avatarLoading.value = false
  }
}
</script>

<template>
  <div class="flex w-100% h-100%">
    <ContentWrap title="个人信息" class="w-400px">
      <div class="flex justify-center items-center">
        <div
          class="avatar w-[150px] h-[150px] relative cursor-pointer"
          @click="dialogVisible = true"
        >
          <ElImage
            class="w-[150px] h-[150px] rounded-full"
            :src="userInfo?.avatar || defaultAvatar"
            fit="fill"
          />
        </div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>学号/学工号：</div>
        <div>{{ userInfo?.studentId }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>姓名：</div>
        <div>{{ userInfo?.name }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>性别：</div>
        <div>{{ userInfo?.gender ?? '-' }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>学院/部门：</div>
        <div>{{ userInfo?.college ?? '-' }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>角色：</div>
        <div>
          <template v-if="userInfo?.roles?.length">
            <ElTag v-for="role in userInfo?.roles" :key="role.cname" class="ml-2 mb-w"
              >{{ role.cname }}
            </ElTag>
          </template>
          <template v-else>-</template>
        </div>
      </div>
      <ElDivider />
    </ContentWrap>
    <ContentWrap title="基本资料" class="flex-[3] ml-20px">
      <ElTabs v-model="activeName">
        <ElTabPane label="基本信息" name="first">
          <EditInfo :userInfo="userInfo" />
        </ElTabPane>
        <ElTabPane label="学生信息" name="second">
          <EditStudentInfo :studentInfo="studentInfo" />
        </ElTabPane>
        <ElTabPane label="修改密码" name="third">
          <EditPassword />
        </ElTabPane>
      </ElTabs>
    </ContentWrap>
  </div>

  <Dialog v-model="dialogVisible" title="修改头像" width="800px">
    <UploadAvatar ref="uploadAvatarRef" :url="userInfo?.avatar || defaultAvatar" />

    <template #footer>
      <ElButton type="primary" :loading="avatarLoading" @click="saveAvatar"> 保存 </ElButton>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </Dialog>
</template>

<style lang="less" scoped>
.avatar {
  position: relative;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100%;
    font-size: 50px;
    color: #fff;
    background-color: rgb(0 0 0 / 40%);
    border-radius: 50%;
    content: '+';
    opacity: 0;
    justify-content: center;
    align-items: center;
  }

  &:hover {
    &::after {
      opacity: 1;
    }
  }
}
</style>
