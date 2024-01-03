import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {},
  resolve: {},
  plugins: [
    vue(),
    // @ts-ignore
    visualizer({
      // 打包完成后自动打开浏览器，显示产物体积报告
      open: true
    }),
    Components({
      dts: 'types/components.d.ts',
      extensions: ['vue', 'tsx']
    }),
    UnoCSS({
      configFile: './uno.config.ts'
    }),
    monkey({
      entry: 'src/main.ts',
      server: {
        prefix: 'alex-yapi'
      },
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: ['*/project/*/interface/api/*'],
        'run-at': 'document-body',
        require: [
          'https://unpkg.com/dayjs/dayjs.min.js',
          'https://unpkg.com/dayjs/plugin/customParseFormat.js',
          'https://unpkg.com/dayjs/plugin/weekday.js',
          'https://unpkg.com/dayjs/plugin/localeData.js',
          'https://unpkg.com/dayjs/plugin/weekOfYear.js',
          'https://unpkg.com/dayjs/plugin/weekYear.js',
          'https://unpkg.com/dayjs/plugin/advancedFormat.js',
          'https://unpkg.com/dayjs/plugin/quarterOfYear.js'
          // 'https://cdn.jsdelivr.net/npm/json-schema-to-typescript@4.1.0/dist/bundle.js'
        ]
      },
      build: {
        externalGlobals: {
          vue: cdn
            .jsdelivr('Vue', 'dist/vue.global.prod.js')
            // 处理vue使用iife将变量挂载在window导致无法被组件库引用到的问题
            .concat(
              'data:application/javascript,' +
                encodeURIComponent(
                  `try{this.Vue = this.Vue ?? Vue }catch{}try{window.Vue = window.Vue ?? Vue}catch{}`
                )
            ),
          'ant-design-vue': cdn.jsdelivr('antd', 'dist/antd.min.js'),
          lodash: cdn.jsdelivr('_', 'lodash.min.js'),
          dayjs: cdn.jsdelivr('dayjs', 'dayjs.min.js'),
          axios: cdn.jsdelivr('axios', 'dist/axios.min.js'),
          'js-beautify': cdn.jsdelivr('js_beautify', 'js/lib/beautify.min.js'),
          'json-schema-to-typescript/dist/bundle.js': cdn.jsdelivr('jstt', 'dist/bundle.js')
        },
        externalResource: {
          'highlight.js/styles/stackoverflow-light.css':
            'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/stackoverflow-light.css'
        }
      }
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${resolve('src/style/index.less')}";`
        },
        javascriptEnabled: true
      }
    }
  }
})
