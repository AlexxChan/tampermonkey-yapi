<template>
  <a-drawer v-model:open="settingVisible" title="设置" width="800" :closable="false">
    <a-form :model="setting" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="接口前缀" extra="该值会自动添加到生成的请求方法的url之前">
        <a-input v-model:value="setting.urlPrefix" />
      </a-form-item>
      <a-form-item label="模板类型">
        <a-radio-group
          v-model:value="setting.apiTemplateType"
          label="api模板类型"
          @change="onChange"
        >
          <a-radio-button v-for="item in apiTemplateTypeList" :key="item.field" :value="item.field">
            {{ item.name }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-divider>模板</a-divider>
      <a-form-item label="前置模板" extra="代码顶部模板">
        <a-textarea v-model:value="setting.frontTemplate" auto-size />
      </a-form-item>
      <a-form-item label="api模板" extra="api生成模板，使用ejs语法">
        <a-textarea v-model:value="setting.apiTemplate" auto-size />
      </a-form-item>
      <a-form-item label="后置模板" extra="代码底部模板">
        <a-textarea v-model:value="setting.behindTemplate" auto-size />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { TemplateConfig } from '../config/template'
  import { useGlobalSetting } from '../store/setting'

  const labelCol = { span: 3 }
  const wrapperCol = { span: 19 }

  const settingVisible = ref(false)

  const { setting } = useGlobalSetting()

  const apiTemplateTypeList = TemplateConfig

  function onChange() {
    const type = setting.value.apiTemplateType
    const template = apiTemplateTypeList.find((item) => {
      return item.field === type
    })
    setting.value.apiTemplate = template.apiTemplate
    setting.value.frontTemplate = template.frontTemplate
    setting.value.behindTemplate = template.behindTemplate
  }

  defineExpose({
    open: () => {
      settingVisible.value = true
    }
  })
</script>

<style scoped lang="less"></style>
