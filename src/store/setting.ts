import { createGlobalState, useStorage } from '@vueuse/core'
import { ref, watch, watchEffect } from 'vue'
import { useUrlParams } from '../hook/useUrlParams'

interface SettingData {
  urlPrefix?: string
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
