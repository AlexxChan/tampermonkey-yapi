export function parseUrl() {
  const url = window.location.href
  const regex = /project\/(\d+)\/interface\/(?:api\/(cat)_(\d+)|api\/(\d+))/
  const match = url.match(regex)

  const state = {
    isClassify: false,
    isInterface: false,
    projectId: '',
    classifyId: '',
    interfaceId: ''
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
      state.interfaceId = match[4]
      state.classifyId = ''
    }
  }

  return state
}
