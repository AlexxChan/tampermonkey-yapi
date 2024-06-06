import { createGlobalState, useStorage } from '@vueuse/core'
import { ref, watch, watchEffect } from 'vue'
import { useUrlParams } from '../hook/useUrlParams'

export interface SettingData {
  urlPrefix?: string
  apiTemplateType: 'vue3Ts' | 'vue2Frame' | 'vue2Common' | 'custom'
  apiTemplate?: string
  frontTemplate?: string
  behindTemplate?: string
}

type SettingStorage = Record<string, SettingData>

export const useGlobalSetting = createGlobalState(() => {
  const { projectId } = useUrlParams()

  const data = useStorage<SettingStorage>('global-setting-arr', {})

  const setting = ref(data.value[projectId.value] || {})

  watch(
    setting,
    () => {
      data.value[projectId.value] = setting.value
    },
    {
      deep: true
    }
  )

  watchEffect(() => {
    setting.value = data.value[projectId.value] || {}
  })

  return { setting }
})
