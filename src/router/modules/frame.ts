import type { RouteRecordRaw } from 'vue-router'
import { DesktopOutline } from '@vicons/ionicons5'
import { Iframe, Layout } from '@/router/constant'
import { renderIcon } from '@/utils/render'

const routes: RouteRecordRaw[] = [
  {
    path: '/frame',
    name: 'Frame',
    redirect: '/frame/docs',
    component: Layout,
    meta: {
      title: '外部页面',
      sort: 8,
      icon: renderIcon(DesktopOutline),
    },
    children: [
      {
        path: 'naive',
        name: 'frame-naive',
        meta: {
          title: 'NaiveUi(内嵌)',
          frameSrc: 'https://www.naiveui.com',
        },
        component: Iframe,
      },
    ],
  },
]

export default routes
