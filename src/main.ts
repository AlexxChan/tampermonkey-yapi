import 'uno.css'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { registerXhrWatcher } from './utils/onLoadXhr'

registerXhrWatcher()

window.onload = () => {
  console.log('load')
  createApp(App).mount(
    // @ts-ignore
    (() => {
      const dom = document.createElement('div')
      document.body!.append(dom)
      return dom
    })()
  )
}
