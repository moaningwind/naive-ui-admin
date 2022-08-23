<script lang="ts">
export default {
  name: 'Index',
  props: {
    collapsed: {
      type: Boolean,
    },
  },
}
</script>

<template>
  <div class="logo" flex justify-center items-center h16 leading-16 of-hidden ws-nowrap>
    <!-- <img w-auto h-8 src="~@/assets/svg/logo.svg" :class="{ 'mr-2': !collapsed }"> -->
    <h2 v-show="!collapsed" leading-16>
      Naive Ui Admin
    </h2>
  </div>
</template>

