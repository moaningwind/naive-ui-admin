import type { HTMLAttributes, VNode } from 'vue'

declare module 'vue-router' {
  interface RouteMeta {
    // 面包屑和菜单上显示的名称
    title?: string
    // 是否忽略权限
    ignoreAuth?: boolean
    // 页面权限
    permissions?: string | string[]
    // 是否缓存
    keepAlive?: boolean
    // 是否固定在tab上
    affix?: boolean
    // tab上的图标
    icon?: string | (() => VNode)
    // 菜单名后面添加文字或view
    extra?: string | (() => VNode)
    // props
    props?: HTMLAttributes
    // 路由顺序 越小越靠前
    sort?: number
    // 跳转地址
    frameSrc?: string
    // 外链跳转地址
    externalLink?: string
    // 不在menu中显示
    hidden?: boolean
  }
}

export {}
