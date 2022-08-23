import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createRouterGuards } from './router-guards'
import { LoginRoute, RedirectRoute, RootRoute } from '@/router/base'

const modules = import.meta.globEager('./modules/*.ts')

const routeModuleList: RouteRecordRaw[] = []

Object.keys(modules).forEach((key) => {
  const modList = modules[key].default
  routeModuleList.push(...modList)
})

function sortRoute(a, b) {
  return (a.meta?.sort || 0) - (b.meta?.sort || 0)
}

routeModuleList.sort(sortRoute)

// 需要验证权限
export const asyncRoutes = [...routeModuleList]

// 普通路由 无需验证权限
export const constantRouter = [LoginRoute, RootRoute, RedirectRoute]

const router = createRouter({
  history: createWebHashHistory(''),
  routes: constantRouter,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export function setupRouter(app: App) {
  app.use(router)
  // 创建路由守卫
  createRouterGuards(router)
}

export default router
