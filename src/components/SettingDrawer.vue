<template>
  <a-drawer v-model:open="settingVisible" title="设置" width="500" :closable="false">
    1234
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const settingVisible = ref(false)

  defineExpose({
    open: () => {
      settingVisible.value = true
    }
  })
</script>

<style scoped lang="less"></style>
