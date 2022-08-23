import { defineStore } from 'pinia'
import { store } from '@/store'
import projectSetting from '@/settings/projectSetting'

export interface ProjectSettingState {
  navMode: string // 导航模式
  navTheme: string // 导航风格
  headerSetting: IheaderSetting // 顶部设置
  showFooter: boolean // 页脚
  menuSetting: ImenuSetting // 多标签
  multiTabsSetting: ImultiTabsSetting // 多标签
  crumbsSetting: IcrumbsSetting // 面包屑
  permissionMode: string // 权限模式
  isPageAnimate: boolean // 是否开启路由动画
  pageAnimateType: string // 路由动画类型
  isMobile: boolean // 是否处于移动端模式
}

export interface IheaderSetting {
  bgColor: string
  fixed: boolean
  isReload: boolean
}

export interface ImenuSetting {
  minMenuWidth: number
  menuWidth: number
  fixed: boolean
  mixMenu: boolean
  collapsed: boolean
  mobileWidth: number
}

export interface ImultiTabsSetting {
  bgColor: string
  fixed: boolean
  show: boolean
}

export interface IcrumbsSetting {
  show: boolean
  showIcon: boolean
}

const {
  navMode,
  navTheme,
  isMobile,
  headerSetting,
  showFooter,
  menuSetting,
  multiTabsSetting,
  crumbsSetting,
  permissionMode,
  isPageAnimate,
  pageAnimateType,
} = projectSetting

export const useProjectSettingStore = defineStore({
  id: 'app-project-setting',
  state: (): ProjectSettingState => ({
    navMode,
    navTheme,
    isMobile,
    headerSetting,
    showFooter,
    menuSetting,
    multiTabsSetting,
    crumbsSetting,
    permissionMode,
    isPageAnimate,
    pageAnimateType,
  }),
  actions: {
    setIsMobile(value: boolean): void {
      this.isMobile = value
    },
  },
})

// Need to be used outside the setup
export function useProjectSettingStoreWithOut() {
  return useProjectSettingStore(store)
}
