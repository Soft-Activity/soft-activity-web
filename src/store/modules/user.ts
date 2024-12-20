import { defineStore } from 'pinia'
import { store } from '../index'
import { ElMessageBox } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { useTagsViewStore } from './tagsView'
import router from '@/router'

interface UserState {
  userInfo?: API.UserVO
  tokenKey: string
  token: string
  routes?: AppCustomRouteRecordRaw[]
  userRoles?: string[]
  rememberMe: boolean
  loginInfo?: API.UserPasswordLoginDTO
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      userInfo: undefined,
      tokenKey: 'token',
      token: '',
      routes: undefined,
      userRoles: undefined,
      // 记住我
      rememberMe: true,
      loginInfo: undefined
    }
  },
  getters: {
    getTokenKey(): string {
      return this.tokenKey
    },
    getToken(): string {
      this.token = localStorage.getItem('token') || this.token
      return this.token
    },
    getUserInfo(): API.UserVO | undefined {
      return this.userInfo
    },
    getRoutes(): AppCustomRouteRecordRaw[] | undefined {
      return this.routes
    },
    getUserRoles(): string[] | undefined {
      return this.userRoles
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): API.UserPasswordLoginDTO | undefined {
      return this.loginInfo
    },
    //判断是否已经登录
    isLogin(): boolean {
      return this.userInfo?.userId !== undefined
    }
  },
  actions: {
    setTokenKey(tokenKey: string) {
      this.tokenKey = tokenKey
      localStorage.setItem('tokenKey', this.tokenKey)
    },
    setToken(token: string | undefined) {
      this.token = token ?? ''
      localStorage.setItem('token', this.token)
    },
    setUserInfo(userInfo?: API.UserVO) {
      this.userInfo = userInfo
    },
    setRoleRouters(roleRouters: API.RouteVO) {
      this.routes = (roleRouters?.routes as AppCustomRouteRecordRaw[]) || []
      this.userRoles = (roleRouters?.permissions as string[]) || []
    },
    logoutConfirm() {
      const { t } = useI18n()
      ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
        .then(async () => {
          this.reset()
        })
        .catch(() => {})
    },
    reset() {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
      this.setToken('')
      this.setUserInfo(undefined)
      this.setRoleRouters({
        routes: [],
        permissions: []
      })
      router.replace('/login')
    },
    logout() {
      this.reset()
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: API.UserPasswordLoginDTO | undefined) {
      this.loginInfo = loginInfo
    }
  },
  persist: true
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
