import type { MenuItem } from 'mock/menus'
import type { RouteRecordRaw } from 'vue-router'
import { constantRouterIcon } from './router-icons'
import { adminMenus } from '@/api/system/menu'
import { Iframe, Layout, ParentLayout } from '@/router/constant'

const LayoutMap = new Map<string, () => Promise<typeof import('*.vue')>>()

LayoutMap.set('LAYOUT', Layout)
LayoutMap.set('IFRAME', Iframe)

/**
 * 格式化 后端 结构信息并递归生成层级路由表
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generatorRouter = (routerMap: MenuItem[], parent?: MenuItem) => {
  return routerMap.map((item) => {
    const currentRouter: MenuItem = {
      path: `${(parent?.path) || ''}/${item.path}`,
      name: item.name || '',
      component: item.component,
      meta: {
        ...item.meta,
        // from string convert to () => VNode
        icon: constantRouterIcon[item.meta?.icon as string],
        permissions: item.meta?.permissions,
      },
    }

    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)
    // 是否有子菜单，并递归处理
    if (item.children?.length) {
      // 如果未定义 redirect 默认第一个子路由为 redirect
      !item.redirect && (currentRouter.redirect = `${item.path}/${item.children[0].path}`)
      // Recursion
      currentRouter.children = generatorRouter(item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 动态生成菜单
 */
export const generatorDynamicRouter = (): Promise<RouteRecordRaw[]> => {
  return new Promise((resolve, reject) => {
    adminMenus()
      .then((res) => {
        const routeList = generatorRouter(res.result)

        // from MenuItem[] convert to RouteRecordRaw[]
        asyncImportRoute(routeList)

        resolve(routeList as RouteRecordRaw[])
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * 查找views中对应的组件文件
 * */
let viewsModules: Record<string, () => Promise<Recordable>>
export function asyncImportRoute(routes: MenuItem[]) {
  viewsModules = viewsModules || import.meta.glob('../views/**/*.{vue,tsx}')
  if (!routes)
    return
  routes.forEach((item) => {
    if (!item.component && item.meta?.frameSrc)
      item.component = 'IFRAME'

    const { component, name, children } = item
    // from string convert to RouteComponent | () => Promise<RouteComponent>
    if (component) {
      const layoutFound = LayoutMap.get(component as string)
      if (layoutFound)
        item.component = layoutFound
      else
        item.component = dynamicImport(viewsModules, component as string)
    }
    else if (name) {
      item.component = ParentLayout
    }
    children && asyncImportRoute(children)
  })
}

/**
 * 动态导入
 * */
export function dynamicImport(
  viewsModules: Record<string, () => Promise<Recordable>>,
  component: string,
) {
  const keys = Object.keys(viewsModules)
  const matchKeys = keys.filter((key) => {
    let k = key.replace('../views', '')
    const lastIndex = k.lastIndexOf('.')
    k = k.substring(0, lastIndex)
    return k === component
  })
  if (matchKeys?.length === 1) {
    const matchKey = matchKeys[0]
    return viewsModules[matchKey]
  }
  if (matchKeys?.length > 1) {
    console.warn(
      'Please do not create `.vue` and `.TSX` files with the same file name in the same hierarchical directory under the views folder. This will cause dynamic introduction failure',
    )
  }
}
