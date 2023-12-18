<template>
  <div
    id="append-app"
    ref="mainRef"
    class="append-app fixed right-120px top-320px h-60px w-60px flex cursor-pointer items-center justify-center rounded-50% bg-blue-400"
    style="z-index: 10000"
    @click="openSetting"
  >
    <span ref="divRef" class="text-12px text-#fff"> Yapi </span>
  </div>
  <setting-drawer ref="settingRef" />
  <type-drawer ref="typeRef" />
</template>

<script setup lang="ts">
  import { notification } from 'ant-design-vue'
  import { createVNode, ref, render } from 'vue'
  import SettingDrawer from './components/SettingDrawer.vue'
  import TooltipIcon from './components/TooltipIcon.vue'
  import TypeDrawer from './components/TypeDrawer.vue'
  import { parseClassifyId } from './lib/main'
  import { parseUrl } from './utils/new/parseUrl'

  const typeRef = ref()
  const settingRef = ref()

  // const interfaceData = ref<Record<string, any>>()

  function openSetting() {
    settingRef.value?.open()
  }

  /**
   * 将yapi-ts按钮挂载到分类上
   */
  function mountEventOnClassifyNode() {
    const list = document.querySelectorAll(
      '.tree-wrappper>ul>.interface-item-nav>.ant-tree-node-content-wrapper .interface-item:not(.cat_switch_hidden)'
    )

    if (list.length) {
      // 如果有分类，就直接挂载到分类上
      return list.forEach((domEl) => {
        const vm = createVNode(TooltipIcon, {
          title: '查看该分类的ts类型以及请求方法'
        })
        render(vm, domEl)
        ;(vm.el as HTMLElement).addEventListener('click', (e) => {
          e.preventDefault()

          const href = domEl.getAttribute('href') as string
          const classifyId = parseClassifyId(href)
          const classifyName = domEl.textContent || ''
          if (!classifyId)
            return notification.warn({
              placement: 'top',
              message: '未解析到对应的分类id'
            })

          typeRef.value?.open('classify', {
            classifyId,
            classifyName
          })
        })
      })
    }
    // 如果没有分类，就监听dom变化，等dom变化后再次挂载
    const dom = document.querySelector('.left-menu')?.children[1]
    if (dom) {
      const observer = new MutationObserver(() => {
        mountEventOnClassifyNode()
        observer.disconnect()
      })
      observer.observe(dom, {
        childList: true
      })
    } else {
      // 如果dom还没有加载，就延迟100ms再次挂载
      setTimeout(() => {
        mountEventOnClassifyNode()
      }, 100)
    }
  }

  mountEventOnClassifyNode()
</script>

<style lang="less">
  .ant-tooltip-arrow {
    display: none !important;
  }

  .anticon::before {
    display: none !important;
  }
</style>
