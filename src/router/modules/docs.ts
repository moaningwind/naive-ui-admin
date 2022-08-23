import type { RouteRecordRaw } from 'vue-router'
import { DocumentTextOutline } from '@vicons/ionicons5'
import { Layout } from '@/router/constant'
import { renderIcon } from '@/utils/render'

const routes: RouteRecordRaw[] = [
  {
    path: '/external',
    name: 'https://github.com',
    component: Layout,
    meta: {
      title: '项目文档',
      icon: renderIcon(DocumentTextOutline),
      sort: 9,
    },
  },
]

export default routes
