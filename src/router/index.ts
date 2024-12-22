import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    name: 'Redirect',
    component: Layout,
    meta: {
      hidden: true
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'RedirectPath',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {
          hidden: true
        }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/personal-center',
    name: 'Personal',
    meta: {
      title: '个人中心',
      hidden: true,
      canTo: true
    },
    children: [
      {
        path: 'personal-center',
        component: () => import('@/views/PersonalCenter/PersonalCenter.vue'),
        name: 'PersonalCenter',
        meta: {
          title: '个人中心',
          hidden: true,
          canTo: true
        }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/home',
    component: Layout,
    name: 'Home',
    meta: {
      title: '首页',
      icon: 'carbon:home'
    },
    children: [
      {
        path: '',
        name: 'HomePage',
        component: () => import('@/views/Home/HomePage.vue'),
        meta: {
          title: '首页',
          icon: 'carbon:home'
        }
      }
    ]
  },
  {
    path: '/category',
    component: Layout,
    name: 'Category',
    meta: {
      title: '分类管理',
      icon: 'carbon:category'
    },
    children: [
      {
        path: 'list',
        name: 'CategoryList',
        component: () => import('@/views/Category/CategoryList.vue'),
        meta: {
          title: '分类列表',
          icon: 'carbon:category'
        }
      }
    ]
  },
  {
    path: '/activity',
    component: Layout,
    name: 'Activity',
    meta: {
      title: '活动管理',
      icon: 'carbon:activity'
    },
    children: [
      {
        path: 'location',
        name: 'ActivityLocation',
        component: () => import('@/views/Activity/ActivityLocation.vue'),
        meta: {
          title: '地点管理'
        }
      },
      {
        path: 'list',
        name: 'ActivityList',
        component: () => import('@/views/Activity/ActivityList.vue'),
        meta: {
          title: '活动列表'
        }
      },
      {
        path: 'add',
        name: 'ActivityAdd',
        component: () => import('@/views/Activity/ActivityAdd.vue'),
        meta: {
          title: '新建活动'
        }
      },
      {
        path: 'detail',
        name: 'ActivityDetail',
        component: () => import('@/views/Activity/ActivityDetail.vue'),
        meta: {
          title: '活动详情',
          noTagsView: true,
          hidden: true,
          canTo: true,
          activeMenu: '/activity/list'
        }
      },
      {
        path: 'edit',
        name: 'ActivityEdit',
        component: () => import('@/views/Activity/ActivityEdit.vue'),
        meta: {
          title: '活动修改',
          noTagsView: true,
          noCache: true,
          hidden: true,
          canTo: true,
          activeMenu: '/activity/list'
        }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'User',
    meta: {
      title: '用户管理',
      icon: 'carbon:user',
      permission: ['SUPER_ADMIN', 'TEACHER']
    },
    children: [
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/views/User/UserList.vue'),
        meta: {
          title: '用户列表',
          permission: ['SUPER_ADMIN']
        }
      },
      {
        path: 'students',
        name: 'StudentList',
        component: () => import('@/views/User/StudentList.vue'),
        meta: {
          title: '学生列表',
          permission: ['TEACHER']
        }
      }
    ]
  },
  {
    path: '/authorization',
    component: Layout,
    name: 'Authorization',
    meta: {
      title: '权限管理',
      icon: 'carbon:user-admin',
      permission: ['SUPER_ADMIN']
    },
    children: [
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/Authorization/Menu/Menu.vue'),
        meta: {
          title: '菜单管理',
          permission: ['SUPER_ADMIN']
        }
      },
      {
        path: 'roles',
        name: 'RoleList',
        component: () => import('@/views/Authorization/Role/RoleList.vue'),
        meta: {
          title: '角色列表',
          permission: ['SUPER_ADMIN']
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  const resetWhiteNameList = ['Redirect', 'Login', 'NoFind', 'Root']
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !resetWhiteNameList.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
