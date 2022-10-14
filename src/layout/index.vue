<script lang="ts" setup>
import { Logo } from './components/Logo'
import { TabsView } from './components/TagsView'
import { MainView } from './components/Main'
import { AsideMenu } from './components/Menu'
import { PageHeader } from './components/Header'
import { useDesignSettingStore } from '@/store/modules/designSetting'
import { useProjectSettingStore } from '@/store/modules/projectSetting'

const designSettingStore = useDesignSettingStore()
const settingStore = useProjectSettingStore()

const collapsed = ref<boolean>(false)

const { mobileWidth, menuWidth } = settingStore.menuSetting

const isMobile = computed<boolean>({
  get: () => settingStore.isMobile,
  set: val => settingStore.isMobile = val,
})

const fixedHeader = computed(() => {
  const { fixed } = settingStore.headerSetting
  return fixed ? 'absolute' : 'static'
})

const fixedMenu = computed(() => {
  const { fixed } = settingStore.headerSetting
  return fixed ? 'absolute' : 'static'
})

const isMultiTabs = computed(() => {
  return settingStore.multiTabsSetting.show
})

const fixedMulti = computed(() => {
  return settingStore.multiTabsSetting.fixed
})

const inverted = computed(() => {
  const navTheme = settingStore.navTheme
  return ['dark', 'header-dark'].includes(navTheme)
})

const getHeaderInverted = computed(() => {
  const navTheme = settingStore.navTheme
  return ['light', 'header-dark'].includes(navTheme) ? unref(inverted) : !unref(inverted)
})

const leftMenuWidth = computed(() => {
  const { minMenuWidth, menuWidth } = settingStore.menuSetting
  return collapsed.value ? minMenuWidth : menuWidth
})

// 控制显示或隐藏移动端侧边栏
const showSideDrawer = computed({
  get: () => isMobile.value && collapsed.value,
  set: val => (collapsed.value = val),
})

// 判断是否触发移动端模式
const checkMobileMode = () => {
  if (document.body.clientWidth <= mobileWidth)
    isMobile.value = true
  else
    isMobile.value = false

  collapsed.value = false
}

const watchWidth = () => {
  const Width = document.body.clientWidth
  if (Width <= 950)
    collapsed.value = true
  else collapsed.value = false

  checkMobileMode()
}

onMounted(() => {
  checkMobileMode()
  window.addEventListener('resize', watchWidth)
  window.$loading.finish()
})
</script>

<template>
  <n-layout class="layout" :position="fixedMenu" has-sider>
    <n-layout-sider
      v-if="
        !isMobile && settingStore.navMode === 'vertical'
      "
      v-model:collapsed="collapsed"
      class="layout-sider"
      show-trigger="bar"
      :position="fixedMenu"
      collapse-mode="width"
      :collapsed-width="64"
      :width="leftMenuWidth"
      :native-scrollbar="false"
      :inverted="inverted"
    >
      <Logo :collapsed="collapsed" />
      <aside-menu v-model="collapsed" />
    </n-layout-sider>

    <n-drawer
      v-model:show="showSideDrawer"
      class="layout-side-drawer"
      :width="menuWidth"
      placement="left"
    >
      <Logo :collapsed="collapsed" />
      <aside-menu @click-menu-item="collapsed = false" />
    </n-drawer>

    <n-layout :inverted="inverted">
      <n-layout-header :inverted="getHeaderInverted" :position="fixedHeader">
        <page-header v-model="collapsed" :inverted="inverted" />
      </n-layout-header>

      <n-layout-content
        flex-auto min-h-100vh
        :class="{ 'color-#f5f7f9': designSettingStore.darkTheme === false }"
      >
        <div
          relative mx-10px mb-10px
          :class="fixedHeader === 'static' ? 'pt-0' : 'pt-16'"
        >
          <TabsView v-if="isMultiTabs" v-model:collapsed="collapsed" />
          <!-- 不要去考虑 pt-3 和 pt-11 谁优先级高 保证不会同时存在即可 -->
          <div
            :class="{
              'pt-3': !isMultiTabs,
              'pt-11': isMultiTabs && fixedMulti,
            }"
          >
            <MainView />
          </div>
        </div>
      </n-layout-content>
      <n-back-top :right="100" />
    </n-layout>
  </n-layout>
</template>

<style lang="less">
.layout-side-drawer {
  background-color: rgb(0, 20, 40);

  .n-layout-sider {
    min-height: 100vh;
    box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
    position: relative;
    z-index: 13;
    transition: all 0.2s ease-in-out;
  }
}
</style>

<style lang="less" scoped>
.layout {
  display: flex;
  flex: auto;

  .n-layout-sider {
    min-height: 100vh;
    box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
    position: relative;
    z-index: 13;
    transition: all 0.2s ease-in-out;
  }

  .n-layout-header.n-layout-header--absolute-positioned {
    z-index: 11;
  }

  .n-layout-footer {
    background: none;
  }
}
</style>
