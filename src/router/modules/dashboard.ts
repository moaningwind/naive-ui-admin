import type { RouteRecordRaw } from 'vue-router'
import { DashboardOutlined } from '@vicons/antd'
import { Layout } from '@/router/constant'
import { renderIcon } from '@/utils/render'

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    redirect: '/dashboard/workplace',
    component: Layout,
    meta: {
      title: '网站主页',
      icon: renderIcon(DashboardOutlined),
      permissions: ['dashboard_workplace', 'dashboard_console'],
      sort: 0,
    },
    children: [
      {
        path: 'workplace',
        name: 'dashboard-workplace',
        meta: {
          title: '工作台',
          keepAlive: true,
        },
        component: () => import('@/views/dashboard/workplace/workplace.vue'),
      },
      {
        path: 'console',
        name: 'dashboard-console',
        meta: {
          title: '控制台',
          keepAlive: true,
        },
        component: () => import('@/views/dashboard/console/console.vue'),
      },
    ],
  },
]

export default routes
