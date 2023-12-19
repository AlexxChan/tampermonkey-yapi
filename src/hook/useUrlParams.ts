// @ts-nocheck
import { reactive, toRefs } from 'vue'

const params = reactive({
  isClassify: false,
  isInterface: false,
  projectId: '',
  classifyId: '',
  interfaceId: '',
  origin: ''
})

const _historyWrap = function (type) {
  const orig = history[type]
  const e = new Event(type)
  return function () {
    // eslint-disable-next-line prefer-rest-params
    const rv = orig.apply(this, arguments)
    // eslint-disable-next-line prefer-rest-params
    e.arguments = arguments
    window.dispatchEvent(e)
    return rv
  }
}
history.pushState = _historyWrap('pushState')
history.replaceState = _historyWrap('replaceState')

function onUrlChange() {
  const url = window.location.href
  const regex = /project\/(\d+)\/interface\/(?:api\/(cat)_(\d+)|api\/(\d+)|api)/
  const match = url.match(regex)

  const state = {
    isClassify: false,
    isInterface: false,
    projectId: '',
    classifyId: '',
    interfaceId: '',
    origin: window.location.origin
  }

  if (match) {
    state.projectId = match[1]
    if (match[2] === 'cat') {
      state.isClassify = true
      state.isInterface = false
      state.interfaceId = ''
      state.classifyId = match[3]
    } else {
      state.isClassify = false
      state.isInterface = true
      state.interfaceId = match[4] || ''
      state.classifyId = ''
    }
  }
  Object.assign(params, state)
}

window.addEventListener('pushState', onUrlChange)
window.addEventListener('replaceState', onUrlChange)
onUrlChange()

/**
 * 获取响应式的url参数以及对应的信息
 * @returns {ToRefs<UnwrapNestedRefs<{isClassify: boolean, classifyId: string, interfaceId: string, isInterface: boolean, projectId: string}>>}
 */
export function useUrlParams() {
  return toRefs(params)
}
