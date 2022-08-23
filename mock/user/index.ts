import Mock from 'mockjs'
import { resultSuccess } from '../_util'
import type { authOption } from '@/store/modules/user'

const Random = Mock.Random

const token = Random.string('upper', 32, 32)

export interface UserInfo {
  userId: string
  username: string
  realName: string
  avatar: string
  desc: string
  password: string
  token: string
  permissions: authOption[]
}

const adminInfo: UserInfo = {
  userId: '1',
  username: 'admin',
  realName: 'Admin',
  avatar: Random.image(),
  desc: 'manager',
  password: Random.string('upper', 4, 16),
  token,
  permissions: [
    {
      label: '工作台',
      value: 'dashboard_workplace',
    },
    {
      label: '控制台',
      value: 'dashboard_console',
    },
  ],
}

export default [
  {
    url: '/api/login',
    timeout: 1000,
    method: 'post',
    response: () => {
      return resultSuccess({ token })
    },
  },
  {
    url: '/api/admin_info',
    timeout: 1000,
    method: 'get',
    response: () => {
      return resultSuccess(adminInfo)
    },
  },
]
