import type { RouteRecordRaw } from 'vue-router'
import { WalletOutlined } from '@vicons/antd'
import { Layout } from '@/router/constant'
import { renderIcon, renderNew } from '@/utils/render'

const routes: RouteRecordRaw[] = [
  {
    path: '/comp',
    name: 'Comp',
    component: Layout,
    redirect: '/comp/table',
    meta: {
      title: '组件示例',
      icon: renderIcon(WalletOutlined),
      sort: 8,
    },
    children: [
      {
        path: 'richText',
        name: 'comp-richText',
        meta: {
          title: '富文本',
          extra: renderNew(),
        },
        component: () => import('@/views/comp/richText/vue-quill.vue'),
      },
      {
        path: 'drag',
        name: 'comp-drag',
        meta: {
          title: '拖拽',
          extra: renderNew(),
        },
        component: () => import('@/views/comp/drag/drag.vue'),
      },
    ],
  },
]

export default routes
