<template>
  <a-drawer v-model:open="settingVisible" title="设置" width="500" :closable="false">
    <a-form :model="setting" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="接口前缀" extra="该值会自动添加到生成的请求方法的url之前">
        <a-input v-model:value="setting.urlPrefix" />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useGlobalSetting } from '../store/setting'

  const labelCol = { span: 4 }
  const wrapperCol = { span: 18 }

  const settingVisible = ref(true)

  const { setting } = useGlobalSetting()

  defineExpose({
    open: () => {
      settingVisible.value = true
    }
  })
</script>

<style scoped lang="less"></style>
