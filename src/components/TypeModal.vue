<template>
  <a-modal
    v-model:open="visible"
    class="type-modal"
    width="1000px"
    placement="right"
    :closable="false"
    :footer="false"
  >
    <template #title>
      <a-tabs v-model:activeKey="activeKey" size="small" type="card">
        <template #rightExtra>
          <div
            class="h-28px w-full flex items-center bg-#fff pr-20px text-left text-16px font-400 text-#333"
          >
            <a-popover placement="bottom">
              <template #content>
                <a-checkbox-group v-model:value="checkedKeys" style="width: auto">
                  <a-row>
                    <a-col v-for="item in interfaceList" :key="item.id" :span="24">
                      <a-checkbox :value="item.id">{{ item.title }}</a-checkbox>
                    </a-col>
                  </a-row>
                </a-checkbox-group>
              </template>
              <template #title>
                <span>要生成的接口</span>
              </template>
              <CopyOutlined class="mr-20px mt-2px cursor-pointer text-18px" />
            </a-popover>
            <CopyOutlined
              class="ml-10px mt-2px cursor-pointer text-18px"
              @click.prevent="copyCode"
            /> </div
        ></template>
        <a-tab-pane v-for="item in tabs" :key="item.value" :tab="item.label" />
      </a-tabs>
    </template>
    <a-spin :spinning="loading">
      <a-alert
        message="按下tab键切换tab；按下command(ctrl) + c 复制当前代码； 点击蒙层或按下esc关闭弹窗；"
        type="success"
        banner
      />
      <div class="h-60vh overflow-y-scroll">
        <copy-textarea :title="activeTab!.label" :text="state[activeKey]" />
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
  import { CopyOutlined } from '@ant-design/icons-vue'
  import { useMagicKeys, whenever } from '@vueuse/core'
  import { computed, ref, watch } from 'vue'
  import { copyText } from '../new_utils/copy'
  import {
    generateCodesByApiDetailList,
    getInterfaceDetailList,
    InterfaceGenRes
  } from '../new_utils/main'
  import CopyTextarea from './CopyTextarea.vue'

  type DrawerType = 'classify' | 'interface'

  interface ClassifyProps {
    classifyId: string
    classifyName: string
  }

  interface InterfaceProps {
    interfaceId: string
    interfaceName: string
  }

  type DrawerProps<T extends DrawerType> = T extends 'classify' ? ClassifyProps : InterfaceProps

  const visible = ref(false)
  const loading = ref(false)

  const tabs = [
    {
      label: 'ts类型',
      value: 'typeCode'
    },
    {
      label: '函数请求',
      value: 'methodCode'
    }
  ] as const

  const activeKey = ref(tabs[0].value)

  const activeTab = computed(() => tabs.find((item) => item.value === activeKey.value))

  const state = ref({
    methodCode: '',
    typeCode: ''
  })

  const interfaceList = ref<InterfaceGenRes[]>([])

  const checkedKeys = ref<any[]>([])

  const { meta, c, ctrl, tab } = useMagicKeys()

  function nextTab() {
    const currentIndex = tabs.findIndex((item) => item.value === activeKey.value)
    const nextIndex = currentIndex !== tabs.length - 1 ? currentIndex + 1 : 0
    activeKey.value = tabs[nextIndex].value as any
  }

  function copyCode() {
    copyText(state.value[activeKey.value], '复制成功！')
  }

  /**
   * 打开抽屉
   * @param {T} type
   * @param {DrawerProps<T>} data
   * @returns {Promise<void>}
   */
  async function open<T extends DrawerType>(type: T, data: DrawerProps<T>) {
    state.value = {
      methodCode: '',
      typeCode: ''
    }
    try {
      loading.value = true
      if (type === 'classify') {
        const { classifyName, classifyId } = data as ClassifyProps
        visible.value = true
        interfaceList.value = await getInterfaceDetailList(classifyId, classifyName)
        checkedKeys.value = interfaceList.value.map((item) => item.id)
      } else {
        console.log('暂时不支持interface')
      }
    } finally {
      loading.value = false
    }
  }

  watch(
    checkedKeys,
    async () => {
      const list = interfaceList.value.filter((item) => checkedKeys.value.includes(item.id))
      const { typeCode, methodCode } = await generateCodesByApiDetailList(list)
      console.log(11234)
      state.value = {
        methodCode: methodCode,
        typeCode: typeCode
      }
    },
    {
      deep: true
    }
  )

  // 按下ctrl + c 复制当前代码
  whenever(() => (meta.value || ctrl.value) && c.value && visible.value, copyCode)

  // 按下tab键 切换当前的tab
  whenever(() => tab.value && visible.value, nextTab)

  defineExpose({
    open
  })
</script>

<style lang="less">
  .type-modal {
    .ant-modal-header {
      padding: 0 !important;
    }
    .ant-modal-body {
      padding: 0;
    }
  }
</style>
