<template>
  <div
    v-show="!visible"
    id="append-app"
    ref="mainRef"
    class="append-app fixed right-120px top-320px h-60px w-60px flex cursor-pointer items-center justify-center rounded-50% bg-blue-400"
    style="z-index: 10000"
    @click="handleOpen"
  >
    <span ref="divRef" class="text-12px text-#fff"> Yapi </span>
  </div>
  <a-drawer
    v-model:open="visible"
    :mask="false"
    :width="600"
    :title="`【Ts类型】${interfaceData?.title}`"
    placement="right"
  >
    <template #extra>
      <a-button shape="circle" :icon="h(SettingOutlined)" @click="settingVisible = true" />
    </template>
    <div class="h-full">
      <!--   类型   -->
      <section>
        <div class="mb-10px h-22px flex items-center text-left text-16px font-400 text-#333">
          <div class="mr-10px h-18px w-4px bg-red-400 leading-18px"></div>
          <span class="">Ts类型</span>
          <CopyOutlined
            class="ml-10px mt-2px cursor-pointer text-14px"
            @click="onCopy(state.typeCode, '类型复制成功')"
          />
        </div>
        <a-textarea :value="state.typeCode" :autoSize="{ minRows: 5, maxRows: 15 }" />
      </section>
      <!--  函数    -->
      <section class="mt-20px">
        <div class="mb-10px h-18px flex items-center text-left text-16px font-400 text-#333">
          <div class="mr-10px h-18px w-4px bg-red-400 leading-18px"></div>
          <span class="">请求方法</span>
          <CopyOutlined
            class="ml-10px mt-2px cursor-pointer text-14px"
            @click="onCopy(state.methodCode, '请求方法复制成功')"
          />
        </div>
        <a-textarea :value="state.methodCode" :autoSize="{ minRows: 5, maxRows: 15 }" />
      </section>
    </div>
    <a-drawer v-model:open="settingVisible" title="设置" width="500" :closable="false">
      1234
    </a-drawer>
  </a-drawer>
</template>

<script setup lang="ts">
  import { SettingOutlined, CopyOutlined } from '@ant-design/icons-vue'
  import { h, ref } from 'vue'
  import { config } from './const/config'
  import { generateInterfaceCode } from './utils/api/generateCode'
  import { onXhrRequest } from './utils/onLoadXhr'
  import copy from 'copy-to-clipboard'
  import { notification } from 'ant-design-vue'

  const visible = ref(false)
  const settingVisible = ref(false)

  const state = ref<{
    methodCode: string
    typeCode: string
    typeName: string[]
  }>({
    methodCode: '',
    typeCode: '',
    typeName: []
  })

  const interfaceData = ref<Record<string, any>>()

  onXhrRequest(async (url, xhr) => {
    const isGetApi = url.startsWith('/api/interface/get?id=')
    if (isGetApi) {
      clearState()

      const res = JSON.parse(xhr.responseText)
      interfaceData.value = res.data

      const codeData = await generateInterfaceCode(res.data, { ...(config.yapiConfig as any) })

      state.value = {
        methodCode: codeData.methodCode,
        typeCode: codeData.typeCode,
        typeName: codeData.typeNames
      }
    }
  })

  function clearState() {
    interfaceData.value = {}
    state.value = {
      methodCode: '',
      typeCode: '',
      typeName: []
    }
  }

  function handleOpen() {
    visible.value = !visible.value
  }

  function onCopy(val: string, message = '复制成功') {
    copy(val)
    notification.success({
      placement: 'top',
      message: message
    })
  }
</script>

<style lang="less">
  .anticon::before {
    display: none !important;
  }
</style>
