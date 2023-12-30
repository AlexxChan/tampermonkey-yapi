<template>
  <div class="absolute left-50% top-50% h-30px w-30px bg-red-700">
    <a-button>
      <div>click</div>
    </a-button>
  </div>
</template>

<script setup lang="ts">
  import _ from 'lodash'

  console.log(1111, _.isEmpty({}))
</script>

<style lang="less"></style>
