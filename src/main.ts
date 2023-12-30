import 'uno.css'
import { createApp } from 'vue'
import App from './App.vue'

/*白色主题*/
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import hljsVuePlugin from '@highlightjs/vue-plugin'

hljs.registerLanguage('javascript', javascript)
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

const dom = document.createElement('div')
document.body!.append(dom)

createApp(App).use(Antd).use(hljsVuePlugin).mount(dom)
