import router from './router'
import { useAppStoreWithOut } from '@/store/modules/app'
import type { RouteRecordRaw } from 'vue-router'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { NO_REDIRECT_WHITE_LIST } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'

const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()

router.beforeEach(async (to, from, next) => {
  start()
  loadStart()
  const permissionStore = usePermissionStoreWithOut()
  const appStore = useAppStoreWithOut()
  const userStore = useUserStoreWithOut()

  if (userStore.isLogin) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      // 已经添加过路由
      if (permissionStore.getIsAddRouters) {
        // 检查用户是否有权限访问该路由
        // if (to.meta?.permission) {
        //   const userRoles = userStore.userRoles || []
        //   if (!userRoles.some((role) => to.meta?.permission?.includes(role as string))) {
        //     next('/403')
        //     return
        //   }
        // }
        next()
        return
      }

      // 还没有添加路由
      const roleRouters = userStore.getRoutes || []
      const userRoles = userStore.getUserRoles || []

      // 使用动态路由
      if (appStore.getDynamicRouter) {
        // 根据不同模式生成路由
        if (appStore.serverDynamicRouter) {
          // 服务端动态路由模式
          await permissionStore.generateRoutes('server', roleRouters as AppCustomRouteRecordRaw[])
        } else {
          // 前端动态路由模式
          await permissionStore.generateRoutes('frontEnd', userRoles as string[])
        }
      } else {
        // 静态路由模式
        await permissionStore.generateRoutes('static')
      }

      // 添加路由
      permissionStore.getAddRouters.forEach((route) => {
        router.addRoute(route as unknown as RouteRecordRaw)
      })

      // 设置路由已添加标志
      permissionStore.setIsAddRouters(true)

      // 重定向到目标路由
      const redirectPath = from.query.redirect || to.path
      const redirect = decodeURIComponent(redirectPath as string)
      const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect }
      next(nextData)
    }
  } else {
    // 未登录处理
    if (NO_REDIRECT_WHITE_LIST.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done()
  loadDone()
})
