<script lang="ts">
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'
import { useProjectSettingStore } from '@/store/modules/projectSetting'

export default defineComponent({
  name: 'MainView',
  components: {},
  props: {
    notNeedKey: {
      type: Boolean,
      default: false,
    },
    animate: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const settingStore = useProjectSettingStore()
    const asyncRouteStore = useAsyncRouteStore()
    // 需要缓存的路由组件
    const keepAliveComponents = computed(() => asyncRouteStore.keepAliveComponents)

    const getTransitionName = computed(() => {
      return settingStore.isPageAnimate ? settingStore.pageAnimateType : ''
    })

    return {
      keepAliveComponents,
      getTransitionName,
    }
  },
})
</script>

<template>
  <RouterView>
    <template #default="{ Component, route }">
      <transition :name="getTransitionName" mode="out-in" appear>
        <keep-alive v-if="keepAliveComponents" :include="keepAliveComponents">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
        <component :is="Component" v-else :key="route.fullPath" />
      </transition>
    </template>
  </RouterView>
</template>
