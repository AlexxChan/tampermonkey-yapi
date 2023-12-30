import 'uno.css'
import { createApp } from 'vue'
import App from './App.vue'
// import { registerXhrWatcher } from './utils/http/onLoadXhr'

/*白色主题*/
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import hljsVuePlugin from '@highlightjs/vue-plugin'

hljs.registerLanguage('javascript', javascript)

// registerXhrWatcher()

window.onload = () => {
  createApp(App)
    .use(hljsVuePlugin)
    .mount(
      // @ts-ignore
      (() => {
        const dom = document.createElement('div')
        document.body!.append(dom)
        return dom
      })()
    )
}
