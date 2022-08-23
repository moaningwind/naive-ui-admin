<script lang="ts" setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function goHome() {
  router.push('/')
}
</script>

<template>
  <div flex flex-col justify-center w-full h-100vh rounded-4px py-50px>
    <div text-center>
      <img w-88 mx-auto src="~@/assets/svg/500.svg" alt="">
    </div>
    <div text-center>
      <h1 text-base text-gray-500 py-5>
        抱歉，服务器出错了
      </h1>
      <n-button type="info" @click="goHome">
        回到首页
      </n-button>
    </div>
  </div>
</template>
