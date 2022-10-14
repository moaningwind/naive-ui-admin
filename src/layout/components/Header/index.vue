<script lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useDialog, useMessage } from 'naive-ui'
import components from './components'
import ProjectSetting from './ProjectSetting.vue'
import { TABS_ROUTES } from '@/store/mutation-types'
import { useUserStore } from '@/store/modules/user'
import { AsideMenu } from '@/layout/components/Menu'
import { useProjectSettingStore } from '@/store/modules/projectSetting'

export default defineComponent({
  name: 'PageHeader',
  components: { ...components, ProjectSetting, AsideMenu },
  props: {
    'modelValue': Boolean,
    'inverted': Boolean,
    // eslint-disable-next-line vue/prop-name-casing
    'onUpdate:modelValuee': Function,
  },
  // emits: ['update:modelValue'],
  setup(props) {
    const collapsed = useVModel(props, 'modelValue')
    const settingStore = useProjectSettingStore()
    const userStore = useUserStore()

    const state = reactive({
      username: userStore.info?.username || '',
      fullscreenIcon: 'FullscreenOutlined',
    })

    const getInverted = computed(() => {
      const navTheme = settingStore.navTheme
      return ['light', 'header-dark'].includes(navTheme) ? props.inverted : !props.inverted
    })

    const generator = (routerMap) => {
      return routerMap.map((item) => {
        const currentMenu = {
          ...item,
          label: item.meta.title,
          key: item.name,
          disabled: item.path === '/',
        }
        if (item.children && item.children.length > 0)
          currentMenu.children = generator(item.children)

        return currentMenu
      })
    }

    const route = useRoute()
    const breadcrumbList = computed(() => {
      return generator(route.matched)
    })

    const router = useRouter()
    const dropdownSelect = (key) => {
      router.push({ name: key })
    }

    // 刷新页面
    const reloadPage = () => {
      router.push({
        path: `/redirect${unref(route).fullPath}`,
      })
    }

    const message = useMessage()
    const dialog = useDialog()
    // 退出登录
    const doLogout = () => {
      dialog.info({
        title: '提示',
        content: '您确定要退出登录吗',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          userStore.logout().then(() => {
            message.success('成功退出登录')
            // 移除标签页
            localStorage.removeItem(TABS_ROUTES)
            router
              .replace({
                name: 'Login',
                query: {
                  redirect: route.fullPath,
                },
              })
              .finally(() => window.location.reload())
          })
        },
        onNegativeClick: () => {},
      })
    }

    // 切换全屏图标
    const toggleFullscreenIcon = () =>
      (state.fullscreenIcon
        = document.fullscreenElement !== null ? 'FullscreenExitOutlined' : 'FullscreenOutlined')

    // 监听全屏切换事件
    document.addEventListener('fullscreenchange', toggleFullscreenIcon)

    // 全屏切换
    const toggleFullScreen = () => {
      if (document.fullscreenElement)
        document.exitFullscreen()

      else
        document.documentElement.requestFullscreen()
    }

    // 图标列表
    const iconList = [
      {
        icon: 'SearchOutlined',
        tips: '搜索',
      },
    ]
    const avatarOptions = [
      {
        label: '个人设置',
        key: 1,
      },
      {
        label: '退出登录',
        key: 2,
      },
    ]

    // 头像下拉菜单
    const avatarSelect = (key) => {
      switch (key) {
        case 1:
          router.push({ name: 'Setting' })
          break
        case 2:
          doLogout()
          break
      }
    }

    const drawerSetting = ref() // ProjectSetting component
    function openSetting() {
      drawerSetting.value?.openDrawer()
    }

    return {
      settingStore,
      collapsed,
      getInverted,
      ...toRefs(state),
      iconList,
      avatarOptions,
      breadcrumbList,
      drawerSetting,
      doLogout,
      reloadPage,
      dropdownSelect,
      toggleFullScreen,
      avatarSelect,
      openSetting,
    }
  },
})
</script>

<template>
  <div class="layout-header">
    <!-- 顶部菜单 -->
    <div
      v-if="settingStore.navMode === 'horizontal' || settingStore.menuSetting.mixMenu"
      class="layout-header-left"
    >
      <div v-if="settingStore.navMode === 'horizontal'" class="logo">
        <!-- <img src="~@/assets/svg/logo.svg"> -->
        <h2 v-show="!collapsed" leading-16>
          Naive Ui Admin
        </h2>
      </div>
      <AsideMenu
        v-model="collapsed"
        mode="horizontal"
        location="header"
        :inverted="getInverted"
      />
    </div>
    <!-- 左侧菜单 -->
    <div v-else class="layout-header-left">
      <!-- 菜单收起 -->
      <div
        class="ml-1 layout-header-trigger layout-header-trigger-min"
        @click="collapsed = !collapsed"
      >
        <n-icon v-if="collapsed" size="18">
          <MenuUnfoldOutlined />
        </n-icon>
        <n-icon v-else size="18">
          <MenuFoldOutlined />
        </n-icon>
      </div>
      <!-- 刷新 -->
      <div
        v-if="settingStore.headerSetting.isReload"
        class="mr-1 layout-header-trigger layout-header-trigger-min"
        @click="reloadPage"
      >
        <n-icon size="18">
          <ReloadOutlined />
        </n-icon>
      </div>
      <!-- 面包屑 -->
      <n-breadcrumb v-if="settingStore.crumbsSetting.show">
        <template v-for="routeItem in breadcrumbList" :key="routeItem.name">
          <n-breadcrumb-item>
            <n-dropdown
              v-if="routeItem.children.length"
              :options="routeItem.children"
              @select="dropdownSelect"
            >
              <span class="link-text">
                <component
                  :is="routeItem.meta.icon"
                  v-if="settingStore.crumbsSetting.showIcon && routeItem.meta.icon"
                />
                {{ routeItem.meta.title }}
              </span>
            </n-dropdown>
            <span v-else class="link-text">
              <component
                :is="routeItem.meta.icon"
                v-if="settingStore.crumbsSetting.showIcon && routeItem.meta.icon"
              />
              {{ routeItem.meta.title }}
            </span>
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>
    </div>
    <div class="layout-header-right">
      <div
        v-for="item in iconList"
        :key="item.icon"
        class="layout-header-trigger layout-header-trigger-min"
      >
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-icon size="18">
              <component :is="item.icon" />
            </n-icon>
          </template>
          <span>{{ item.tips }}</span>
        </n-tooltip>
      </div>
      <!-- 切换全屏 -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-icon size="18">
              <component :is="fullscreenIcon" @click="toggleFullScreen" />
            </n-icon>
          </template>
          <span>全屏</span>
        </n-tooltip>
      </div>
      <!-- 个人中心 -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-dropdown trigger="hover" :options="avatarOptions" @select="avatarSelect">
          <div class="avatar">
            <n-avatar round>
              {{ username }}
            </n-avatar>
          </div>
        </n-dropdown>
      </div>
      <!-- 设置 -->
      <div class="layout-header-trigger layout-header-trigger-min" @click="openSetting">
        <n-tooltip placement="bottom-end">
          <template #trigger>
            <n-icon size="18" style="font-weight: bold">
              <SettingOutlined />
            </n-icon>
          </template>
          <span>项目配置</span>
        </n-tooltip>
      </div>
    </div>
  </div>
  <!-- 项目配置 -->
  <ProjectSetting ref="drawerSetting" />
</template>

<style lang="less" scoped>
.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  height: @header-height;
  box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
  transition: all 0.2s ease-in-out;
  width: 100%;
  z-index: 11;

  &-left {
    display: flex;
    align-items: center;

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64px;
      line-height: 64px;
      overflow: hidden;
      white-space: nowrap;
      padding-left: 10px;

      img {
        width: auto;
        height: 32px;
        margin-right: 10px;
      }
    }

    :deep(.ant-breadcrumb span:last-child .link-text) {
      color: #515a6e;
    }

    .n-breadcrumb {
      display: inline-block;
    }

    &-menu {
      color: var(--text-color);
    }
  }

  &-right {
    display: flex;
    align-items: center;
    margin-right: 20px;

    .avatar {
      display: flex;
      align-items: center;
      height: 64px;
    }

    > * {
      cursor: pointer;
    }
  }

  &-trigger {
    display: inline-block;
    width: 64px;
    height: 64px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    .n-icon {
      display: flex;
      align-items: center;
      height: 64px;
      line-height: 64px;
    }

    &:hover {
      background: hsla(0, 0%, 100%, 0.08);
    }

    .anticon {
      font-size: 16px;
      color: #515a6e;
    }
  }

  &-trigger-min {
    width: auto;
    padding: 0 12px;
  }
}

.layout-header-light {
  background: #fff;
  color: #515a6e;

  .n-icon {
    color: #515a6e;
  }

  .layout-header-left {
    :deep(.n-breadcrumb .n-breadcrumb-item:last-child .n-breadcrumb-item__link) {
      color: #515a6e;
    }
  }

  .layout-header-trigger {
    &:hover {
      background: #f8f8f9;
    }
  }
}

.layout-header-fix {
  position: fixed;
  top: 0;
  right: 0;
  left: 200px;
  z-index: 11;
}
</style>
