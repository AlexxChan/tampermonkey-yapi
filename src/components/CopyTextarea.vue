<template>
  <section class="">
    <div class="mb-10px h-18px flex items-center text-left text-16px font-400 text-#333">
      <div class="mr-10px h-18px w-4px bg-red-400 leading-18px"></div>
      <span class="">{{ title }}</span>
      <CopyOutlined
        class="ml-10px mt-2px cursor-pointer text-14px"
        @click="copyText(text, copySuccessMsg)"
      />
    </div>
    <a-textarea :value="text" :autoSize="{ minRows: 5, maxRows: 15 }" />
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
