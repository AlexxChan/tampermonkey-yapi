import dayjs from 'dayjs'
import dedent from 'dedent-js'
import { camelCase, castArray } from 'lodash-es'
import { Interface, MethodEnum } from '../formatTs/type.js'
import {
  getRequestDataJsonSchema,
  getResponseDataJsonSchema,
  jsonSchemaToType
} from '../formatTs/utils.js'
import { pascalCase } from '../pascalCase.js'

type GenCommentFunc = (func: (title: string) => string) => string

interface SyntheticalConfig {
  url: string
  token: string
  projectId: string
  classifyInfo: any
  dataKey?: string
  urlPrefix?: string
}

const TREE_SHAKING_ANNOTATION = '/*#__PURE__*/'

/**
 * 返回一个生成注释的函数, 返回的函数接收一个返回标题的函数作为参数
 * @param {Interface} interfaceInfo 接口信息
 * @param {SyntheticalConfig} syntheticalConfig 配置信息
 * @return {GenCommentFunc} 生成注释的函数
 */
function getGenCommentFunc(
  interfaceInfo: Interface,
  syntheticalConfig: SyntheticalConfig
): GenCommentFunc {
  const getUrl = (path: string) =>
    `${syntheticalConfig.url}/project/${syntheticalConfig.projectId}/interface/api/${path}`
  // 转义标题中的 /
  const escapedTitle = interfaceInfo.title.replace(/\//g, '\\/')
  const description = dedent`[${escapedTitle}↗](${getUrl(String(interfaceInfo._id))})`

  /**
   *	获取额外标题
   */
  const extraComment = (
    [
      // {
      //   label: '分类',
      //   value: `[${syntheticalConfig?.classifyInfo?.name}↗](${getUrl(
      //     `cat_${syntheticalConfig?.classifyInfo?._id}`
      //   )})`
      // },
      {
        label: '标签',
        value: interfaceInfo.tag.map((tag) => `${tag}  `)
      },
      {
        label: '请求头',
        value: interfaceInfo.method.toUpperCase()
      },
      {
        label: '创建人',
        value: interfaceInfo.username
      },
      {
        label: '更新时间',
        value: dayjs(interfaceInfo.up_time * 1000).format('YYYY-MM-DD HH:mm:ss')
      }
    ] as Array<{
      label: string
      value: string | string[]
    }>
  )
    .map((item) => `* @${item.label} ${castArray(item.value).join(', ')}`)
    .join('\n')

  // 接口注释
  return (genTitle: (title: string) => string) => {
    const titleComment = dedent`
					* ${genTitle(description)}
					*
        `
    return dedent`
		
    /**
    	     ${[titleComment, extraComment].join('\n')}
    */`
  }
}

export function getApiFuncName(interfaceInfo: Interface): string {
  return camelCase(interfaceInfo.path.split('/').splice(-2, 2).join('-'))
}

/**
 * 生成代码
 * @param {Interface} interfaceInfo
 * @param {SyntheticalConfig} syntheticalConfig
 * @return {Promise<{typeNames: string[], methodCode: string, typeCode: string}>}
 */
export async function generateInterfaceCode(
  interfaceInfo: Interface,
  syntheticalConfig: SyntheticalConfig
) {
  // 请求方法的名称
  const requestFunctionName = getApiFuncName(interfaceInfo)
  // 请求数据类型名称
  const requestDataTypeName = pascalCase(`${requestFunctionName}Request`)
  // 相应数据类型名称
  const responseDataTypeName = pascalCase(`${requestFunctionName}Response`)

  // 获取请求数据的类型
  const requestDataJsonSchema = getRequestDataJsonSchema(interfaceInfo, {})
  const requestDataType = await jsonSchemaToType(requestDataJsonSchema, requestDataTypeName)
  // 获取相应数据的类型
  const filterKey = ['data', 'success']
  const responseDataJsonSchema = getResponseDataJsonSchema(interfaceInfo, {}, filterKey)
  const responseDataType = await jsonSchemaToType(responseDataJsonSchema, responseDataTypeName)

  // todo

  // 支持路径参数
  // const paramNames = (interfaceInfo.req_params ?? []).map((item) => item.name)
  // const paramNamesLiteral = JSON.stringify(paramNames)
  // const paramNameType = paramNames.length === 0 ? 'string' : `'${paramNames.join("' | '")}'`
  //
  // // 支持查询参数
  // const queryNames = (interfaceInfo.req_query /* istanbul ignore next */ || []).map(
  //   (item) => item.name
  // )
  // const queryNamesLiteral = JSON.stringify(queryNames)
  // const queryNameType = queryNames.length === 0 ? 'string' : `'${queryNames.join("' | '")}'`

  const genComment = getGenCommentFunc(interfaceInfo, syntheticalConfig)

  const typeCode = dedent`
				${genComment((title) => `接口 ${title} 的 **请求类型**`)}
				${requestDataType.trim()}
				${genComment((title) => `接口 ${title} 的 **返回类型**`)}
				${responseDataType.trim()}
      
      `
  const methodCode = dedent`
					${genComment((title) => `接口 ${title} 的 **请求函数**`)}
					export const ${requestFunctionName} = ${TREE_SHAKING_ANNOTATION} (
						data: ${requestDataTypeName}, 
					) => {
						return defHttp.request<${responseDataTypeName}>(
							{
								url: ${JSON.stringify(syntheticalConfig.urlPrefix + interfaceInfo.path)},
								method: '${interfaceInfo.method}',
								${interfaceInfo.method === MethodEnum.GET ? 'params: data' : 'data'} 
							}
						)
					}
		`
  return {
    typeCode,
    methodCode,
    typeNames: [requestDataTypeName, responseDataTypeName]
  }
}
