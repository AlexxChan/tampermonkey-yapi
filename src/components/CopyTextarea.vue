<template>
  <section class="relative">
    <highlightjs class="mt-18px" language="javascript" :code="beautifyJs(text)" />
  </section>
</template>

<script setup lang="ts">
  import { beautifyJs } from '../new_utils/beautifyJs'

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
