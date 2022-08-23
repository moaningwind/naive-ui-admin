import type { MenuItem } from 'mock/menus'
import { http } from '@/utils/http'

/**
 * @description: 根据用户id获取用户菜单
 */
export function adminMenus() {
  return http.request<MenuItem[]>({
    url: '/menus',
    method: 'GET',
  })
}
