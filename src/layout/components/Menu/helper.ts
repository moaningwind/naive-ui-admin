import type { RouteRecordRaw } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import type { VNode } from 'vue'
import { PageEnum } from '@/enums/pageEnum'

/**
 * 递归组装菜单格式
 */
export function generatorMenu(routerMap: RouteRecordRaw[]) {
  return filterRouter(routerMap).map((item) => {
    const currentMenu: MenuOption = {
      ...item.meta,
      // type error fixed
      icon: item.meta?.icon as (() => VNode),
      label: item.meta?.title,
      key: item.name as string,
    }
    if (item.children?.length) {
      // Recursion
      currentMenu.children = generatorMenu(item.children)
    }
    return currentMenu
  })
}

/**
 * 混合菜单
 * */
export function generatorMenuMix(routerMap: RouteRecordRaw[], routerName: string, location: string) {
  if (location === 'header')
    return generatorMenu(routerMap.filter(item => item.name !== routerName))

  else
    return generatorMenu(routerMap.filter(item => item.name === routerName))
}

/**
 * 过滤不在menu中显示的Router
 * */
export function filterRouter(routerMap: RouteRecordRaw[]) {
  return routerMap.filter((item) => {
    return (
      (item.meta?.hidden || false) !== true
      && !['/:path(.*)*', '/', PageEnum.REDIRECT, PageEnum.BASE_LOGIN].includes(item.path)
    )
  })
}
