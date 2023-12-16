<template>
  <span>
    <a-tooltip placement="top" :title="title" :color="color">
      <span class="ml-5px inline-block h-full w-20px rounded-4px text-center hover:bg-gray-200">
        <FilePdfTwoTone class="align-middle text-14px" />
      </span>
    </a-tooltip>
  </span>
</template>

<script setup lang="ts">
  import { FilePdfTwoTone } from '@ant-design/icons-vue'

  withDefaults(
    defineProps<{
      title: string
      color?: string
    }>(),
    {
      color: 'blue'
    }
  )
</script>

<style scoped lang="less"></style>
