<script lang="ts" setup>
import { useRoute } from 'vue-router'

const currentRoute = useRoute()
const loading = ref(false)
const frameRef = ref<HTMLIFrameElement | null>(null)
const frameSrc = ref<string>('')

if (unref(currentRoute.meta)?.frameSrc)
  frameSrc.value = unref(currentRoute.meta)?.frameSrc as string

function hideLoading() {
  loading.value = false
}

function init() {
  nextTick(() => {
    const iframe = unref(frameRef)
    if (!iframe)
      return
    const _frame = iframe as any
    if (_frame.attachEvent) {
      _frame.attachEvent('onload', () => {
        hideLoading()
      })
    }
    else {
      iframe.onload = () => {
        hideLoading()
      }
    }
  })
}

onMounted(() => {
  loading.value = true
  init()
})
</script>

<template>
  <n-spin :show="loading">
    <div w-full h-100vh>
      <iframe ref="frameRef" w-full h-full of-hidden b-0 box-border :src="frameSrc" />
    </div>
  </n-spin>
</template>

