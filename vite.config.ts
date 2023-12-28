import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
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
      dts: 'components.d.ts',
      resolvers: [
        AntDesignVueResolver({
          importStyle: false // css in js
        })
        // 组件的有效文件扩展名。
      ],
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
        'run-at': 'document-start',
        require: ['https://cdn.jsdelivr.net/npm/json-schema-to-typescript@4.6.5/dist/bundle.js']
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js')
          // 'lodash-es': 'https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js'
        },
        // todo
        externalResource: {
          './static/tts.js': `https://cdn.jsdelivr.net/npm/json-schema-to-typescript@4.6.5/dist/bundle.js`
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
