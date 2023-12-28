import dedent from 'dedent-js'
import { getClassifyAllInterfaceDetail } from '../api/core'
import { config } from '../const/config'
import { useGlobalSetting } from '../store/setting'
import { generateInterfaceCode } from './generateCode'

const { setting } = useGlobalSetting()

export type InterfaceGenRes = {
  title: string
  id: number
  typeCode: string
  methodCode: string
  typeNames: [requestDataTypeName: string, responseDataTypeName: string]
}

type CodeAryReduceReturn = { typesCode: string[]; methodsCode: string[]; typeNames: string[] }

/**
 * @description 从链接中解析出分类id
 * @param {string} link
 * @returns {string | undefined}
 */
export function parseClassifyId(link: string) {
  const regex = /cat_(\d+)/
  const match = link.match(regex)
  return match?.[1]
}

/**
 * 获取分类下的所有接口详情
 * @param {string} classifyId
 * @param classifyName
 * @returns {Promise<Awaited<{typeNames: any[], methodCode: string, typeCode: string}>[]>}
 */
export async function getInterfaceDetailList(
  classifyId: string,
  classifyName: string
): Promise<InterfaceGenRes[]> {
  const interfaceList = await getClassifyAllInterfaceDetail(classifyId)
  return await Promise.all(
    interfaceList.map(async (detail) =>
      // todo 类型
      generateInterfaceCode(detail as any, {
        ...config.yapiConfig,
        urlPrefix: setting.value.urlPrefix || '',
        classifyInfo: {
          _id: classifyId,
          name: classifyName
        }
      })
    )
  )
}

/**
 * @description 根据classifyId生成ts代码
 * @returns {Promise<{typeNames: any, methodCode: string, typeCode: string}>}
 * @param codeAry
 */
export async function generateCodesByApiDetailList(codeAry: InterfaceGenRes[]) {
  const { typesCode, methodsCode, typeNames } = codeAry.reduce<CodeAryReduceReturn>(
    (prev, { typeCode, methodCode, typeNames }) => {
      prev.typesCode.push(typeCode)
      prev.methodsCode.push(methodCode)
      prev.typeNames.push(...typeNames)
      return prev
    },
    {
      typesCode: [],
      methodsCode: [],
      typeNames: []
    }
  )

  const completeMethodCode = dedent`
        ${generateApiFuncName(typeNames)}
    		${methodsCode.join('\n')}
    	`

  const completeTypeCode = dedent`
    		${typesCode.join('\n')}
    	`

  return {
    methodCode: completeMethodCode,
    typeCode: completeTypeCode,
    typeNames: typeNames
  }
}

/**
 * @description 生成请求方法页面导入类型的部分
 */
function generateApiFuncName(typeNames: string[]) {
  const completeMethodCode = dedent`
    		import defHttp from '/@/utils/http/axios';
    		import { ${typeNames.join(',')} } from "./model/xxxx.js"
    	`
  return completeMethodCode
}
