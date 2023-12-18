import { createGlobalState, useStorage } from '@vueuse/core'
import { parseUrl } from '../utils/new/parseUrl'

export const useGlobalSetting = createGlobalState(() => {
  // todo 目前页面切换不会自动更新，后续改成使用路由监听和响应式
  const { projectId } = parseUrl()

  const setting = useStorage(`global-setting-${projectId}`, {
    // 前缀
    urlPrefix: ''
  })

  return { setting }
})
