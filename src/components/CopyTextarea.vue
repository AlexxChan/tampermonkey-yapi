<template>
  <section class="relative">
    <highlightjs class="mt-18px" language="javascript" :code="text" />
  </section>
</template>

<script setup lang="ts">
  import { CopyOutlined } from '@ant-design/icons-vue'
  import { copyText } from '../utils/new/copy'

  withDefaults(
    defineProps<{
      title: string
      text: string
      copySuccessMsg?: string
    }>(),
    {
      copySuccessMsg: '复制成功'
    }
  )
</script>

<style scoped lang="less"></style>
