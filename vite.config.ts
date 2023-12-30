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
    vue({
      script: {
        defineModel: true
      }
    }),
    // @ts-ignore
    visualizer({
      // 打包完成后自动打开浏览器，显示产物体积报告
      open: true
    }),
    Components({
      dts: 'components.d.ts',
      resolvers: [],
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
        ]
      },
      build: {
        // lodash：引入的库的名称; _: 引入的库内部导出的全局变量名称； lodash.min.js: 引入的库的路径
        // lodash: cdn.jsdelivr('_', 'lodash.min.js')
        externalGlobals: {
          vue: cdn
            .jsdelivr('Vue', 'dist/vue.global.prod.js')
            .concat(
              'data:application/javascript,' +
                encodeURIComponent(
                  `try{this.Vue = this.Vue ?? Vue }catch{}try{window.Vue = window.Vue ?? Vue}catch{}`
                )
            ),
          // 'element-plus': cdn.jsdelivr('ElementPlus', 'dist/index.full.min.js'),
          'ant-design-vue': cdn.jsdelivr('antd', 'dist/antd.min.js'),
          lodash: cdn.jsdelivr('_', 'lodash.min.js')
          // 'highlight.js/lib/core': cdn.jsdelivr('hljs', '/lib/core.js'),
          // 'highlight.js/lib/languages/typescript.js': cdn.jsdelivr(
          //   'typescript',
          //   '/lib/languages/typescript.js'
          // )
        },
        externalResource: {
          'element-plus/dist/index.css': 'https://unpkg.com/element-plus/dist/index.css'
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
