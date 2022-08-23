import type { RouteComponent, RouteRecordRaw } from 'vue-router'
import { resultSuccess } from '../_util'

export type MenuItem = Omit<RouteRecordRaw, 'component' | 'children'> & {
  component?: string | RouteComponent | (() => Promise<RouteComponent>)
  children?: MenuItem[]
}

const menusList: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: 'LAYOUT',
    redirect: '/dashboard/workplace',
    meta: {
      title: 'Dashboard',
      icon: 'DashboardOutlined',
    },
    children: [
      {
        path: 'workplace',
        name: 'dashboard_workplace',
        component: '/dashboard/workplace/workplace',
        meta: {
          title: '工作台',
        },
      },
      {
        path: 'console',
        name: 'dashboard_console',
        component: '/dashboard/console/console',
        meta: {
          title: '控制台',
        },
      },
    ],
  },
]

export default [
  {
    url: '/api/menus',
    timeout: 1000,
    method: 'get',
    response: () => {
      return resultSuccess(menusList)
    },
  },
]
