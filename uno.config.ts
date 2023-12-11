// import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import presetAttributify from '@unocss/preset-attributify'
// import presetIcons from '@unocss/preset-icons'
import presetWind from '@unocss/preset-wind'
import transformerAttributifyJsx from '@unocss/transformer-attributify-jsx'
import { defineConfig, UserConfig } from 'unocss'

const config: UserConfig = defineConfig({
  // 配置全局片段
  shortcuts: [
    {
      'u-full': 'w-full h-full', // full
      'u-flex-center': 'flex items-center justify-center', // flex布局居中
      'u-flex-between': 'w-full flex justify-between', // flex布局两端对齐
      'u-title': 'truncate font-500 text-16px text-[#333]', // 标题样式
      'u-text-description': 'font-400 text-14px text-[#666]' // 小标题样式
    }
  ],
  presets: [
    presetWind(),
    // presetIcons({
    //   collections: {
    //     custom: FileSystemIconLoader('./src/assets/icons')
    //   }
    // }),
    // vue支持uno属性化
    // 使用自定义属性必须带前缀 u- 如 u-text="red-500"
    presetAttributify({
      /* preset options */
      prefix: 'u-',
      prefixedOnly: true // 使用自定义属性必须带前缀 u- 如 u-text="red-500"
    })
  ],
  transformers: [
    transformerAttributifyJsx() // <-- jsx模式设置支持属性化
  ],
  theme: {
    colors: {
      primary: '#cb1516', // 全局主色
      brand: {
        primary: 'hsla(var(--hue, 217), 78%, 51%)' //class="bg-brand-primary"
      }
    }
  }
})

export default config
