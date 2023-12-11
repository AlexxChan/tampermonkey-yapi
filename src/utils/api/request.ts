import { Interface } from '../../../utils/formatTs/type.js'
import isDebug from '../../../utils/isDebug.js'
import request from '../../../utils/request/request.js'

enum Api {
  INFO = '/api/project/get',
  MENU = '/api/interface/getCatMenu',
  API_LIST = '/api/interface/list_cat',
  ALL_API_LIST = '/api/interface/list',
  API_DETAIL = '/api/interface/get'
}

interface YapiConfig {
  url: string
  token: string
  projectId: string
}

// eslint-disable-next-line max-lines-per-function
export default function getYapiRequest(config: YapiConfig) {
  const { url, token, projectId } = config

  const yapiHttp = request.create({
    baseURL: url,
    timeout: 15 * 1000,
    // 对接收的 data 进行任意转换处理
    transformResponse: [
      (data) => {
        const parseData = JSON.parse(data)
        isDebug() && console.log(parseData)
        return parseData?.data
      }
    ]
  })

  return {
    queryBasicInfo: () => yapiHttp.get(Api.INFO, { params: { token } }),

    queryClassify: () =>
      yapiHttp.get(Api.MENU, {
        params: {
          token,
          // eslint-disable-next-line camelcase
          project_id: projectId
        }
      }),

    // todo 根据id区分
    queryApiList: (catid?: string | number) => {
      const url = catid ? Api.API_LIST : Api.ALL_API_LIST
      // eslint-disable-next-line camelcase
      const params = catid ? { catid } : { project_id: projectId }
      return yapiHttp.get(url, {
        params: {
          token: token,
          page: 1,
          limit: 1000,
          ...params
        }
      })
    },

    queryDetail: (id: string | number): Promise<{ data: Interface }> =>
      yapiHttp.get(Api.API_DETAIL, {
        params: {
          id,
          token
        }
      })
  }
}
