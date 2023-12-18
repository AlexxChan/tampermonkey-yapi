import dedent from 'dedent-js'
import { getClassifyAllInterfaceDetail } from '../api/core'
import { config } from '../const/config'
import { useGlobalSetting } from '../store/setting'
import { generateInterfaceCode } from '../utils/api/generateCode'
const { setting } = useGlobalSetting()

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
 * @description 根据classifyId生成ts代码
 * @param {string} classifyId
 * @param {string} classifyName
 * @returns {Promise<{typeNames: any, methodCode: string, typeCode: string}>}
 */
export async function generateCodesByClassify(classifyId: string, classifyName: string) {
  const interfaceList = await getClassifyAllInterfaceDetail(classifyId)

  const codeAry = await Promise.all(
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
