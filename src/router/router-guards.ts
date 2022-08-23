import { isNavigationFailure } from 'vue-router'
import type { Router } from 'vue-router'
import { useUserStoreWidthOut } from '@/store/modules/user'
import { useAsyncRouteStoreWithOut } from '@/store/modules/asyncRoute'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { createLocalStorage } from '@/utils/cache'
import { PageEnum } from '@/enums/pageEnum'
import { ErrorPageRoute } from '@/router/base'

const storage = createLocalStorage()

const LOGIN_PATH = PageEnum.BASE_LOGIN

const whitePathList = [LOGIN_PATH] // no redirect whitelist

export function createRouterGuards(router: Router) {
  const userStore = useUserStoreWidthOut()
  const asyncRouteStore = useAsyncRouteStoreWithOut()
  router.beforeEach(async (to, from, next) => {
    window.$loading.start()
    if (from.path === LOGIN_PATH && to.name === 'errorPage') {
      next(PageEnum.BASE_HOME)
      return
    }

    // Whitelist can be directly entered
    if (whitePathList.includes(to.path as PageEnum)) {
      next()
      return
    }

    const token = storage.get<string>(ACCESS_TOKEN)

    if (!token) {
      // You can access without permissions. You need to set the routing meta.ignoreAuth to true
      if (to.meta.ignoreAuth) {
        next()
        return
      }
      // redirect login page
      const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
        path: LOGIN_PATH,
        replace: true,
      }
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        }
      }
      next(redirectData)
      return
    }

    if (asyncRouteStore.isDynamicAddedRoute) {
      next()
      return
    }

    const userInfo = await userStore.GetInfo()

    const routes = await asyncRouteStore.generateRoutes(userInfo)

    // 动态添加可访问路由表
    routes.forEach((item) => {
      router.addRoute(item)
    })

    // 添加404
    const isErrorPage = router.getRoutes().findIndex(item => item.name === ErrorPageRoute.name)
    if (isErrorPage === -1)
      router.addRoute(ErrorPageRoute)

    const redirectPath = (from.query.redirect as string) || to.path
    const redirect = decodeURIComponent(redirectPath)
    const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect }
    asyncRouteStore.setDynamicAddedRoute(true)
    next(nextData)
    window.$loading.finish()
  })

  router.afterEach((to, _, failure) => {
    document.title = (to?.meta?.title as string) || document.title
    if (isNavigationFailure(failure)) {
      // console.log('failed navigation', failure)
    }
    const asyncRouteStore = useAsyncRouteStoreWithOut()
    // 在这里设置需要缓存的组件名称
    const keepAliveComponents = asyncRouteStore.keepAliveComponents
    const currentComName: any = to.matched.find(item => item.name === to.name)?.name
    if (currentComName && !keepAliveComponents.includes(currentComName) && to.meta?.keepAlive) {
      // 需要缓存的组件
      keepAliveComponents.push(currentComName)
    }
    else if (!to.meta?.keepAlive || to.name === 'Redirect') {
      // 不需要缓存的组件
      const index = asyncRouteStore.keepAliveComponents.findIndex(name => name === currentComName)
      if (index !== -1)
        keepAliveComponents.splice(index, 1)
    }
    asyncRouteStore.setKeepAliveComponents(keepAliveComponents)
    window.$loading.finish()
  })

  router.onError((error) => {
    // eslint-disable-next-line no-console
    console.log(error, '路由错误')
  })
}
