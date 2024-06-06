export type TemplateType = 'vue3Ts' | 'vue2Frame' | 'vue2Common' | 'custom'

export const TemplateConfig = [
  {
    name: 'vue3Ts',
    field: 'vue3Ts',
    apiTemplate: `
        export const <%= base.apiName %> = /*#__PURE__*/ (data: <%= type.paramsType %>) => {
          return defHttp.request<<%= type.responseType %>>({
            url: '<%= base.url %>',
            method: '<%= base.method %>',
            params: data
          })
        }`,
    frontTemplate: `
        import defHttp from '@/utils/http/axios';
    		import { <%= typeNames.join(",") %> } from "./model/xxxx"
    `,
    behindTemplate: ''
  },
  {
    name: '小程序请求',
    field: 'vue2Common',
    apiTemplate: `
      export const <%= base.apiName %> = (params, config = {}) => {
        return http.post('<%= base.url %>', params, config)
      }
    `,
    frontTemplate: `
      import { http } from 'uview-plus'
    `,
    behindTemplate: ''
  },
  {
    name: 'vue2框架请求方式',
    field: 'vue2Frame',
    apiTemplate: `
      <%= base.apiName %> (data) {
        return http.postJson('<%= base.url %>', data)
      },
  `,
    frontTemplate: `
      export default function (http) {
        return {
    `,
    behindTemplate: `
      }
     }
    `
  },
  { name: '自定义', field: 'custom', apiTemplate: '', frontTemplate: '', behindTemplate: '' }
]
