<script lang="ts">
import {
  CloseOutlined,
  ColumnWidthOutlined,
  LeftOutlined,
  MinusOutlined,
  ReloadOutlined,
  RightOutlined,
} from '@vicons/antd'
import Draggable from 'vuedraggable'
import elementResizeDetectorMaker from 'element-resize-detector'
import { useMessage, useThemeVars } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'

import { useDesignSettingStore } from '@/store/modules/designSetting'
import { useProjectSettingStore } from '@/store/modules/projectSetting'
import type { RouteItem } from '@/store/modules/tabsView'
import { useTabsViewStore } from '@/store/modules/tabsView'
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'

import { createLocalStorage } from '@/utils/cache'
import { TABS_ROUTES } from '@/store/mutation-types'
import { PageEnum } from '@/enums/pageEnum'
import { renderIcon } from '@/utils/render'
import { useGo } from '@/hooks/web/usePage'

export default defineComponent({
  name: 'TabsView',
  components: {
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
    Draggable,
  },
  props: {
    collapsed: {
      type: Boolean,
    },
  },
  setup(props) {
    const designSettingStore = useDesignSettingStore()
    const settingStore = useProjectSettingStore()

    const route = useRoute()
    const router = useRouter()

    // style
    const themeVars = useThemeVars()

    const getCardColor = computed(() => {
      return themeVars.value.cardColor
    })

    const getBaseColor = computed(() => {
      return themeVars.value.textColor1
    })

    const storage = createLocalStorage()
    const tabsViewStore = useTabsViewStore()
    const asyncRouteStore = useAsyncRouteStore()

    const go = useGo()

    const navScroll = shallowRef<HTMLElement>()
    const navWrap = ref<HTMLElement>()
    const isCurrent = ref(false)

    const state = reactive({
      activeKey: route.fullPath,
      scrollable: false,
      dropdownX: 0,
      dropdownY: 0,
      showDropdown: false,
      isMultiHeaderFixed: false,
    })

    const getPartialRoute = (route): RouteItem => {
      const { fullPath, hash, meta, name, params, path, query } = route
      return { fullPath, hash, meta, name, params, path, query }
    }

    // 动态组装样式 菜单缩进
    const getChangeStyle = computed(() => {
      const { collapsed } = props
      const { minMenuWidth, menuWidth } = settingStore.menuSetting
      const { fixed } = settingStore.multiTabsSetting
      const lenNum
        = settingStore.navMode === 'horizontal'
          ? '0px'
          : collapsed
            ? `${minMenuWidth}px`
            : `${menuWidth}px`

      if (settingStore.isMobile) {
        return {
          left: '0px',
          width: '100%',
        }
      }
      return {
        left: lenNum,
        width: `calc(100% - ${!fixed ? '0px' : lenNum})`,
      }
    })

    // 标签页列表
    const tabsList: any = computed(() => tabsViewStore.tabsList)

    // tags 右侧下拉菜单
    const TabsMenuOptions = computed(() => {
      const isDisabled = unref(tabsList).length <= 1
      return [
        {
          label: '刷新当前',
          key: '1',
          icon: renderIcon(ReloadOutlined),
        },
        {
          label: '关闭当前',
          key: '2',
          disabled: unref(isCurrent) || isDisabled,
          icon: renderIcon(CloseOutlined),
        },
        {
          label: '关闭其他',
          key: '3',
          disabled: isDisabled,
          icon: renderIcon(ColumnWidthOutlined),
        },
        {
          label: '关闭全部',
          key: '4',
          disabled: isDisabled,
          icon: renderIcon(MinusOutlined),
        },
      ]
    })

    let cacheRoutes: RouteItem[] = []
    const partialRoute = getPartialRoute(route)
    try {
      const routesStr = storage.get<string>(TABS_ROUTES)
      cacheRoutes = routesStr ? JSON.parse(routesStr) : [partialRoute]
    }
    catch (e) {
      cacheRoutes = [partialRoute]
    }

    // 将最新的路由信息同步到 localStorage 中
    const routes = router.getRoutes()
    cacheRoutes.forEach((cacheRoute) => {
      const route = routes.find(route => route.path === cacheRoute.path)
      if (route) {
        cacheRoute.meta = route.meta || cacheRoute.meta
        cacheRoute.name = (route.name as string) || cacheRoute.name
      }
    })

    // 初始化标签页
    tabsViewStore.initTabs(cacheRoutes)

    // 移除缓存组件名称
    const delKeepAliveCompName = () => {
      if (route.meta.keepAlive) {
        const name = router.currentRoute.value.matched.find(item => item.name === route.name)
          ?.components?.default.name
        if (name) {
          asyncRouteStore.keepAliveComponents = asyncRouteStore.keepAliveComponents.filter(
            item => item !== name,
          )
        }
      }
    }

    const whiteList: string[] = [
      PageEnum.BASE_LOGIN_NAME,
      PageEnum.REDIRECT_NAME,
      PageEnum.ERROR_PAGE_NAME,
    ]

    watch(
      () => route.fullPath,
      (to) => {
        if (whiteList.includes(route.name as string))
          return
        state.activeKey = to
        tabsViewStore.addTabs(getPartialRoute(route))
        updateNavScroll(true)
      },
      { immediate: true },
    )

    // 在页面关闭或刷新之前，保存数据
    window.addEventListener('beforeunload', () => {
      storage.set(TABS_ROUTES, JSON.stringify(tabsList.value))
    })

    const message = useMessage()
    // 关闭当前页面
    const removeTab = (route) => {
      if (tabsList.value.length === 1)
        return message.warning('这已经是最后一页，不能再关闭了！')

      delKeepAliveCompName()
      tabsViewStore.closeCurrentTab(route)
      // 如果关闭的是当前页
      if (state.activeKey === route.fullPath) {
        const currentRoute = tabsList.value[Math.max(0, tabsList.value.length - 1)]
        state.activeKey = currentRoute.fullPath
        router.push(currentRoute)
      }
      updateNavScroll()
    }

    // 刷新页面
    const reloadPage = () => {
      delKeepAliveCompName()
      router.push({
        path: `/redirect${unref(route).fullPath}`,
      })
    }

    // 注入刷新页面方法
    provide('reloadPage', reloadPage)

    // 关闭左侧
    const closeLeft = (route) => {
      tabsViewStore.closeLeftTabs(route)
      state.activeKey = route.fullPath
      router.replace(route.fullPath)
      updateNavScroll()
    }

    // 关闭右侧
    const closeRight = (route) => {
      tabsViewStore.closeRightTabs(route)
      state.activeKey = route.fullPath
      router.replace(route.fullPath)
      updateNavScroll()
    }

    // 关闭其他
    const closeOther = (route) => {
      tabsViewStore.closeOtherTabs(route)
      state.activeKey = route.fullPath
      router.replace(route.fullPath)
      updateNavScroll()
    }

    // 关闭全部
    const closeAll = () => {
      tabsViewStore.closeAllTabs()
      router.replace(PageEnum.BASE_HOME)
      updateNavScroll()
    }

    // tab 操作
    const closeHandleSelect = (key) => {
      switch (key) {
        // 刷新
        case '1':
          reloadPage()
          break
        // 关闭
        case '2':
          removeTab(route)
          break
        // 关闭其他
        case '3':
          closeOther(route)
          break
        // 关闭所有
        case '4':
          closeAll()
          break
      }
      updateNavScroll()
      state.showDropdown = false
    }

    /**
     * @param value 要滚动到的位置
     * @param amplitude 每次滚动的长度
     */
    function scrollTo(value: number, amplitude: number) {
      if (!navScroll.value)
        return
      const currentScroll = navScroll.value.scrollLeft
      const scrollWidth
        = (amplitude > 0 && currentScroll + amplitude >= value)
        || (amplitude < 0 && currentScroll + amplitude <= value)
          ? value
          : currentScroll + amplitude
      navScroll.value && navScroll.value.scrollTo(scrollWidth, 0)
      if (scrollWidth === value)
        return
      return window.requestAnimationFrame(() => scrollTo(value, amplitude))
    }

    function scrollPrev() {
      if (!navScroll.value)
        return
      const containerWidth = navScroll.value.offsetWidth
      const currentScroll = navScroll.value.scrollLeft

      if (!currentScroll)
        return
      const scrollLeft = currentScroll > containerWidth ? currentScroll - containerWidth : 0
      scrollTo(scrollLeft, (scrollLeft - currentScroll) / 20)
    }

    function scrollNext() {
      if (!navScroll.value)
        return
      const containerWidth = navScroll.value.offsetWidth
      const navWidth = navScroll.value.scrollWidth
      const currentScroll = navScroll.value.scrollLeft

      if (navWidth - currentScroll <= containerWidth)
        return
      const scrollLeft
        = navWidth - currentScroll > containerWidth * 2
          ? currentScroll + containerWidth
          : navWidth - containerWidth
      scrollTo(scrollLeft, (scrollLeft - currentScroll) / 20)
    }

    /**
     * @param autoScroll 是否开启自动滚动功能
     */
    async function updateNavScroll(autoScroll?: boolean) {
      await nextTick()
      if (!navScroll.value)
        return
      const containerWidth = navScroll.value.offsetWidth
      const navWidth = navScroll.value.scrollWidth

      if (containerWidth < navWidth) {
        state.scrollable = true
        if (autoScroll) {
          const tagList = navScroll.value.querySelectorAll('.tabs-card-scroll-item') || []
          Array.prototype.forEach.call(tagList, (tag: HTMLElement) => {
            if (tag.id === `tag${state.activeKey.split('/').join('\/')}`)
              tag.scrollIntoView && tag.scrollIntoView()
          })
        }
      }
      else {
        state.scrollable = false
      }
    }

    function handleResize() {
      updateNavScroll(true)
    }

    function handleContextMenu(e, item) {
      e.preventDefault()
      isCurrent.value = PageEnum.BASE_HOME_REDIRECT === item.path
      state.showDropdown = false
      nextTick().then(() => {
        state.showDropdown = true
        state.dropdownX = e.clientX
        state.dropdownY = e.clientY
      })
    }

    function onClickOutside() {
      state.showDropdown = false
    }

    // tags 跳转页面
    function goPage(e) {
      const { fullPath } = e
      if (fullPath === route.fullPath)
        return
      state.activeKey = fullPath
      go(e, true)
    }

    // 删除tab
    function closeTabItem(e) {
      const { fullPath } = e
      const routeInfo = tabsList.value.find(item => item.fullPath === fullPath)
      removeTab(routeInfo)
    }

    onMounted(() => {
      onElementResize()
    })

    function onElementResize() {
      const observer = elementResizeDetectorMaker()
      observer.listenTo(navWrap.value, handleResize)
    }

    return {
      settingStore,
      designSettingStore,
      ...toRefs(state),
      navWrap,
      navScroll,
      route,
      tabsList,
      goPage,
      closeTabItem,
      closeLeft,
      closeRight,
      closeOther,
      closeAll,
      reloadPage,
      getChangeStyle,
      TabsMenuOptions,
      closeHandleSelect,
      scrollNext,
      scrollPrev,
      handleContextMenu,
      onClickOutside,
      getCardColor,
      getBaseColor,
    }
  },
})
</script>

<template>
  <div
    class="tabs-view"
    :class="{
      'tabs-view-fix': settingStore.multiTabsSetting.fixed,
      'tabs-view-fixed-header': isMultiHeaderFixed,
      'tabs-view-default-background': designSettingStore.darkTheme === false,
      'tabs-view-dark-background': designSettingStore.darkTheme === true,
    }"
    :style="getChangeStyle"
  >
    <div class="tabs-view-main">
      <div ref="navWrap" class="tabs-card" :class="{ 'tabs-card-scrollable': scrollable }">
        <span
          class="tabs-card-prev"
          :class="{ 'tabs-card-prev-hide': !scrollable }"
          @click="scrollPrev"
        >
          <n-icon size="16" color="#515a6e">
            <LeftOutlined />
          </n-icon>
        </span>
        <span
          class="tabs-card-next"
          :class="{ 'tabs-card-next-hide': !scrollable }"
          @click="scrollNext"
        >
          <n-icon size="16" color="#515a6e">
            <RightOutlined />
          </n-icon>
        </span>
        <div ref="navScroll" class="tabs-card-scroll">
          <Draggable :list="tabsList" animation="300" item-key="fullPath" class="flex">
            <template #item="{ element }">
              <div
                :id="`tag${element.fullPath.split('/').join('\/')}`"
                class="tabs-card-scroll-item"
                :class="{ 'active-item': activeKey === element.path }"
                @click.stop="goPage(element)"
                @contextmenu="handleContextMenu($event, element)"
              >
                <span>{{ element.meta.title }}</span>
                <n-icon v-if="!element.meta.affix" size="14" @click.stop="closeTabItem(element)">
                  <CloseOutlined />
                </n-icon>
              </div>
            </template>
          </Draggable>
        </div>
      </div>

      <n-dropdown
        :show="showDropdown"
        :x="dropdownX"
        :y="dropdownY"
        placement="bottom-start"
        :options="TabsMenuOptions"
        @clickoutside="onClickOutside"
        @select="closeHandleSelect"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tabs-view {
  width: 100%;
  padding: 6px 0;
  display: flex;
  transition: all 0.2s ease-in-out;

  &-main {
    height: 32px;
    display: flex;
    max-width: 100%;
    min-width: 100%;

    .tabs-card {
      -webkit-box-flex: 1;
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;
      position: relative;

      .tabs-card-prev,
      .tabs-card-next {
        width: 32px;
        text-align: center;
        position: absolute;
        line-height: 32px;
        cursor: pointer;

        .n-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          width: 32px;
        }
      }

      .tabs-card-prev {
        left: 0;
      }

      .tabs-card-next {
        right: 0;
      }

      .tabs-card-next-hide,
      .tabs-card-prev-hide {
        display: none;
      }

      &-scroll {
        white-space: nowrap;
        overflow: hidden;

        &-item {
          background: v-bind(getCardColor);
          color: v-bind(getBaseColor);
          height: 32px;
          padding: 6px 16px 4px;
          border-radius: 3px;
          margin-right: 6px;
          cursor: pointer;
          display: inline-block;
          position: relative;
          flex: 0 0 auto;

          span {
            float: left;
            vertical-align: middle;
          }

          &:hover {
            color: #515a6e;
          }

          .n-icon {
            height: 22px;
            width: 21px;
            margin-right: -6px;
            position: relative;
            vertical-align: middle;
            text-align: center;
            color: #808695;

            &:hover {
              color: #515a6e !important;
            }

            svg {
              height: 21px;
              display: inline-block;
            }
          }
        }

        .active-item {
          color: v-bind('designSettingStore.appTheme');
        }
      }
    }

    .tabs-card-scrollable {
      padding: 0 32px;
      overflow: hidden;
    }
  }
}

.tabs-view-default-background {
  background: #f5f7f9;
}

.tabs-view-dark-background {
  background: #101014;
}

.tabs-view-fix {
  position: fixed;
  padding: 6px 19px 6px 10px;
  left: 200px;
}

.tabs-view-fixed-header {
  top: 0;
}
</style>
