import type { UserInfo } from 'mock/user'
import { http } from '@/utils/http'

export interface LoginInfo {
  token: string
}

/**
 * @description: 获取用户信息
 */
export function getUserInfo() {
  return http.request<UserInfo>({
    url: '/admin_info',
    method: 'get',
  })
}

/**
 * @description: 用户登录
 */
export function login(params) {
  return http.request<LoginInfo>({
    url: '/login',
    method: 'POST',
    params,
  })
}

/**
 * @description: 用户登出
 */
export function logout(params) {
  return http.request({
    url: '/login/logout',
    method: 'POST',
    params,
  })
}
