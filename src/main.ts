import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

const dom = document.createElement('div')
document.body!.append(dom)

createApp(App).use(Antd).mount(dom)
