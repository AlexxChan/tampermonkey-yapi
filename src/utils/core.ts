import dedent from 'dedent-js'
import { getClassifyAllInterfaceDetail } from '../api/core'
import { generateInterfaceCode } from './generateCode'
import { compile } from 'ejs'

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
export function parseClassifyId(link: string): string | undefined {
  const regex = /cat_(\d+)/
  const match = link.match(regex)
  return match?.[1]
}

/**
 * 获取分类下的所有接口详情
 * @returns {Promise<Awaited<{typeNames: any[], methodCode: string, typeCode: string}>[]>}
 * @param props
 */
export async function getInterfaceDetailList(props: {
  url: string
  projectId: string
  pathPrefix: string
  classifyId: string
  classifyName: string
  apiTemplate: string
}): Promise<InterfaceGenRes[]> {
  const { classifyName, classifyId, pathPrefix, url, projectId, apiTemplate } = props
  const interfaceList = await getClassifyAllInterfaceDetail(classifyId)
  return await Promise.all(
    interfaceList.map(async (detail) =>
      // todo 类型
      generateInterfaceCode(detail as any, {
        url,
        projectId,
        urlPrefix: pathPrefix,
        apiTemplate,
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
 * @param config
 */
export async function generateCodesByApiDetailList(
  codeAry: InterfaceGenRes[],
  config: {
    frontTemplate: string
    behindTemplate: string
  }
): Promise<{ typeNames: any; methodCode: string; typeCode: string }> {
  const { frontTemplate = '', behindTemplate = '' } = config
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

  const frontCode = compile(frontTemplate)({ typeNames })
  const behindCode = behindTemplate

  const completeMethodCode = dedent`
        ${frontCode}
    		${methodsCode.join('\n')}
    		${behindCode}
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
