import type { RouteRecordRaw } from 'vue-router'
import { ProjectOutlined } from '@vicons/antd'
import { Layout } from '@/router/constant'
import { renderIcon, renderNew } from '@/utils/render'

const routes: RouteRecordRaw[] = [
  {
    path: '/about',
    name: 'About',
    redirect: '/about/item',
    component: Layout,
    meta: {
      title: '关于项目',
      icon: renderIcon(ProjectOutlined),
      sort: 10,
    },
    children: [
      {
        path: 'item',
        name: 'about-item',
        meta: {
          title: '依赖项',
          extra: renderNew(),
        },
        component: () => import('@/views/about/item.vue'),
      },
    ],
  },
]

export default routes
