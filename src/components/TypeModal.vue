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
  import { useUrlParams } from '../hook/useUrlParams'
  import { useGlobalSetting } from '../store/setting'
  import { copyText } from '../utils/tools/copy'
  import {
    generateCodesByApiDetailList,
    getInterfaceDetailList,
    InterfaceGenRes
  } from '../utils/core'
  import CopyTextarea from './CopyTextarea.vue'

  interface ClassifyProps {
    classifyId: string
    classifyName: string
  }

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

  const { setting } = useGlobalSetting()

  const { projectId, origin } = useUrlParams()

  const state = ref({
    methodCode: '',
    typeCode: ''
  })

  const interfaceList = ref<InterfaceGenRes[]>([])

  const checkedKeys = ref<any[]>([])

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
   * @param {DrawerProps<T>} data
   * @returns {Promise<void>}
   */
  async function open(data: ClassifyProps) {
    state.value = {
      methodCode: '',
      typeCode: ''
    }
    try {
      loading.value = true
      visible.value = true

      const { classifyName, classifyId } = data
      interfaceList.value = await getInterfaceDetailList({
        classifyId,
        classifyName,
        pathPrefix: setting.value.urlPrefix || '',
        apiTemplate: setting.value.apiTemplate || '',
        url: origin.value,
        projectId: projectId.value
      })
      checkedKeys.value = interfaceList.value.map((item) => item.id)
    } finally {
      loading.value = false
    }
  }

  watch(
    checkedKeys,
    async () => {
      const list = interfaceList.value.filter((item) => checkedKeys.value.includes(item.id))
      const { typeCode, methodCode } = await generateCodesByApiDetailList(list, {
        frontTemplate: setting.value.frontTemplate || '',
        behindTemplate: setting.value.behindTemplate || ''
      })
      state.value = {
        methodCode: methodCode,
        typeCode: typeCode
      }
    },
    {
      deep: true
    }
  )

  /**
   * 监听键盘事件
   */
  const { meta, c, ctrl, tab } = useMagicKeys()

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
