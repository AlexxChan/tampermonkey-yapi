// import { createApp } from 'vue'
// import App from './App.vue'
// import 'uno.css'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'

// import Antd from 'ant-design-vue'
// import 'ant-design-vue/dist/reset.css'
import { unsafeWindow } from '$'

console.log(11, window)
console.log(22, unsafeWindow)

// whatever it is serve or build mode, unsafeWindow is always host window
if (unsafeWindow == window) {
  console.log('scope->host, host esm scope')
} else {
  console.log('scope->monkey, userscript scope')
}

// GM_log('hello world')
// GM_getTabs((tabs) => {
//   console.log(123, tabs)
//   for (const [tabId, tab] of Object.entries(tabs)) {
//     console.log(`tab ${tabId}`, tab)
//   }
// })
