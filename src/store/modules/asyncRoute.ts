import { defineStore } from 'pinia'
import type { UserInfo } from 'mock/user'
import type { RouteRecordRaw } from 'vue-router'
import { store } from '@/store'
import { asyncRoutes, constantRouter } from '@/router/index'
import { generatorDynamicRouter } from '@/router/generator-routers'
import { useProjectSettingStore } from '@/store/modules/projectSetting'

export interface IAsyncRouteState {
  menus: RouteRecordRaw[]
  routers: RouteRecordRaw[]
  addRouters: RouteRecordRaw[]
  keepAliveComponents: string[]
  isDynamicAddedRoute: boolean
}

export const useAsyncRouteStore = defineStore({
  id: 'app-async-route',
  state: (): IAsyncRouteState => ({
    menus: [],
    routers: constantRouter,
    addRouters: [],
    keepAliveComponents: [],
    // 是否已经动态添加了路由
    isDynamicAddedRoute: false,
  }),
  actions: {
    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added
    },
    // 设置动态路由
    setRouters(routers: RouteRecordRaw[]) {
      // TODO
      // @ts-expect-error use recursion
      this.addRouters = routers
      this.routers = constantRouter.concat(routers)
    },
    // 设置动态路由
    setMenus(menus: RouteRecordRaw[]) {
      this.menus = menus
    },
    // 设置需要缓存的组件
    setKeepAliveComponents(compNames) {
      this.keepAliveComponents = compNames
    },
    async generateRoutes(userInfo: UserInfo) {
      let accessedRouters: RouteRecordRaw[]
      // 用户具有的权限
      const permissionsList = userInfo.permissions

      const routeFilter = (route: RouteRecordRaw) => {
        const { meta } = route
        const { permissions } = meta || {}
        // 当前路由未设置权限
        if (!permissions || !permissions.length)
          return true
        return permissionsList.some(item => permissions.includes(item.value))
      }

      const settingStore = useProjectSettingStore()
      const permissionMode = settingStore.permissionMode

      if (permissionMode === 'BACK') {
        try {
          // 动态获取菜单
          accessedRouters = await generatorDynamicRouter()
          // 权限过滤
          accessedRouters = accessedRouters.filter(routeFilter)
          this.setRouters(accessedRouters)
          this.setMenus(accessedRouters)
          return accessedRouters
        }
        catch (error) {
          // eslint-disable-next-line no-console
          console.log(error)
          return []
        }
      }
      else {
        try {
          // 权限过滤
          accessedRouters = asyncRoutes.filter(routeFilter)
          this.setRouters(accessedRouters)
          this.setMenus(accessedRouters)
          return accessedRouters
        }
        catch (error) {
          // eslint-disable-next-line no-console
          console.log(error)
          return []
        }
      }
    },
  },
})

// Need to be used outside the setup
export function useAsyncRouteStoreWithOut() {
  return useAsyncRouteStore(store)
}
