import { useUserStore } from '@/store/modules/user'
import { isString } from '@/utils/is'

export function usePermission() {
  const userStore = useUserStore()

  /**
   * 判断是否存在权限
   * 可用于 v-if 显示逻辑
   * */
  function hasPermission(accesses: undefined | string | string[]): boolean {
    if (!accesses || !accesses.length)
      return true
    return isString(accesses) ? hasSomePermission([accesses]) : hasSomePermission(accesses)
  }

  /**
   * 是否包含指定的所有权限
   * @param accesses
   */
  function hasEveryPermission(accesses: string[]): boolean {
    const permissionsList = userStore.permissions
    if (Array.isArray(accesses))
      return permissionsList.every((access: any) => accesses.includes(access.value))

    throw new Error(`[hasEveryPermission]: ${accesses} should be a array !`)
  }

  /**
   * 是否包含其中某个权限
   * @param accesses
   */
  function hasSomePermission(accesses: string[]): boolean {
    const permissionsList = userStore.permissions
    if (Array.isArray(accesses))
      return permissionsList.some(access => accesses.includes(access.value))

    throw new Error(`[hasSomePermission]: ${accesses} should be a array !`)
  }

  return { hasPermission, hasEveryPermission, hasSomePermission }
}
