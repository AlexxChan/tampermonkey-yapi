<template>
  <a-drawer
    v-model:open="visible"
    :mask="false"
    :width="600"
    :title="`【Ts类型】${title}`"
    placement="right"
  >
    <a-spin :spinning="loading">
      <div class="h-full">
        <!--   类型  -->
        <copy-textarea title="Ts类型" :text="state.typeCode" copySuccessMsg="Ts类型复制成功" />
        <!--   函数  -->
        <copy-textarea
          title="函数方法"
          :text="state.methodCode"
          copySuccessMsg="请求函数复制成功"
          class="mt-20px"
        />
      </div>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { generateCodesByClassify } from '../lib/main'
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
  const title = ref('')

  const state = ref({
    methodCode: '',
    typeCode: ''
  })

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
        const { classifyId, classifyName } = data as ClassifyProps
        visible.value = true
        const { typeCode, methodCode } = await generateCodesByClassify(classifyId, classifyName)
        state.value = {
          methodCode,
          typeCode
        }
      } else {
        console.log('暂时不支持interface')
      }
    } finally {
      loading.value = false
    }
  }

  defineExpose({
    open
  })
</script>
