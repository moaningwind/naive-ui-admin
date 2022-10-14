<script lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { generatorMenu, generatorMenuMix } from './helper'
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'
import { useProjectSettingStore } from '@/store/modules/projectSetting'
import { isUrl } from '@/utils/is'

export default defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: 'Menu',
  props: {
    // 菜单模式
    'mode': {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'vertical',
    },
    // 侧边栏菜单是否收起
    'modelValue': Boolean,
    // 位置
    'location': {
      type: String,
      default: 'left',
    },
    'onClickMenuItem': Function,
    // eslint-disable-next-line vue/prop-name-casing
    'onUpdate:modelValue': Function,
  },
  // emits: ['update:modelValue'],
  setup(props) {
    const collapsed = useVModel(props, 'modelValue')
    const asyncRouteStore = useAsyncRouteStore()
    const settingStore = useProjectSettingStore()

    const route = useRoute()
    const menus = ref<MenuOption[]>([])
    const openKeys = ref(route.matched.map(item => item.name as string))

    const inverted = computed(() => {
      return ['dark', 'header-dark'].includes(settingStore.navTheme)
    })

    let selectedKeys = route.name as string
    let headerMenuSelectKey = ''
    const getSelectedKeys = computed(() => {
      const { location } = props
      return location === 'left' || (location === 'header' && settingStore.navMode === 'horizontal')
        ? selectedKeys
        : headerMenuSelectKey
    })

    // 监听分割菜单
    watch(
      () => settingStore.menuSetting.mixMenu,
      () => {
        updateMenu()
        collapsed && (collapsed.value = false)
      },
    )

    // 跟随页面路由变化，切换菜单选中状态
    watch(
      () => route.fullPath,
      () => {
        updateMenu()
        openKeys.value = route.matched.map(item => item.name as string)
        selectedKeys = route.name as string
      },
    )

    function updateMenu() {
      if (!settingStore.menuSetting.mixMenu) {
        // @ts-expect-error use recursion
        menus.value = generatorMenu(asyncRouteStore.menus)
      }
      // 混合菜单
      else {
        const firstRouteName = (route.matched[0].name as string) || ''
        headerMenuSelectKey = firstRouteName
        // TODO
        // @ts-expect-error Why does Typescript prompt an error
        menus.value = generatorMenuMix(asyncRouteStore.menus, firstRouteName, props.location)
      }
    }

    const router = useRouter()
    // 点击菜单
    function clickMenuItem(key: string) {
      if (isUrl(key))
        window.open(key)
      else
        router.push({ name: key })
      props.onClickMenuItem && props.onClickMenuItem(key)
    }

    // 展开菜单
    function menuExpanded(keys: string[]) {
      if (!keys)
        return
      const latestOpenKey = keys.find(key => !openKeys.value.includes(key))
      const isExistChildren = findSubRoute(latestOpenKey)
      openKeys.value = isExistChildren ? (latestOpenKey ? [latestOpenKey] : []) : keys
    }

    // 查找是否存在子路由
    function findSubRoute(key?: string) {
      if (!key)
        return false
      const subRouteChildren = [] as string[]
      for (const { children, key } of unref(menus)) {
        if (children?.length)
          subRouteChildren.push(key as string)
      }
      return subRouteChildren.includes(key)
    }

    onMounted(() => {
      updateMenu()
    })

    return {
      collapsed,
      openKeys,
      menus,
      inverted,
      getSelectedKeys,
      clickMenuItem,
      menuExpanded,
    }
  },
})
</script>

<template>
  <NMenu
    :options="menus"
    :inverted="inverted"
    :mode="mode"
    :collapsed="collapsed"
    :collapsed-width="64"
    :collapsed-icon-size="20"
    :indent="24"
    :expanded-keys="openKeys"
    :value="getSelectedKeys"
    @update:value="clickMenuItem"
    @update:expanded-keys="menuExpanded"
  />
</template>
