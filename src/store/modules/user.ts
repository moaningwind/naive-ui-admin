import { defineStore } from 'pinia'
import type { UserInfo } from 'mock/user'
import { createLocalStorage } from '@/utils/cache'
import { store } from '@/store'
import { ACCESS_TOKEN, CURRENT_USER } from '@/store/mutation-types'
import { ResultEnum } from '@/enums/httpEnum'
import { getUserInfo, login } from '@/api/system/user'

const Storage = createLocalStorage()

export interface authOption {
  label: string
  value: string
}

export interface IUserState {
  token: string
  username: string
  welcome: string
  avatar: string
  permissions: authOption[] // 权限列表 [{ label: '', value: '' }]
  info: UserInfo | undefined
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: Storage.get<string>(ACCESS_TOKEN, ''),
    username: '',
    welcome: '',
    avatar: '',
    permissions: [],
    info: Storage.get<UserInfo>(CURRENT_USER),
  }),
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setAvatar(avatar: string) {
      this.avatar = avatar
    },
    setPermissions(permissions: authOption[] = []) {
      this.permissions = permissions
    },
    setUserInfo(info?: UserInfo) {
      this.info = info
    },
    // 登录
    async login(userInfo) {
      try {
        const response = await login(userInfo)
        const { result, code } = response
        if (code === ResultEnum.SUCCESS) {
          Storage.set(ACCESS_TOKEN, result.token, {
            expires: 7,
          })
          Storage.set(CURRENT_USER, result, {
            expires: 7,
          })
          this.setToken(result.token)
        }
        return Promise.resolve(response)
      }
      catch (e) {
        return Promise.reject(e)
      }
    },
    // 获取用户信息
    GetInfo(): Promise<UserInfo> {
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then((res) => {
            const result = res.result
            if (result.permissions?.length) {
              const permissionsList = result.permissions
              this.setPermissions(permissionsList)
              this.setUserInfo(result)
            }
            else {
              reject(new Error('getInfo: permissionsList must be a non-null array !'))
            }
            this.setAvatar(result.avatar)
            resolve(res.result)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // 登出
    async logout() {
      this.setPermissions()
      this.setUserInfo()
      Storage.remove(ACCESS_TOKEN)
      Storage.remove(CURRENT_USER)
      return Promise.resolve('')
    },
  },
})

// Need to be used outside the setup
export function useUserStoreWidthOut() {
  return useUserStore(store)
}
