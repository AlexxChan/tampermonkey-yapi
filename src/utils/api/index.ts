import dedent from 'dedent-js'
import { config } from '../../const/config'
// import { getConfig } from '../../../utils/getConfig.js'
import { generateInterfaceCode } from './generateCode.js'
import { getInterfaceList } from './getInterface.js'

type CodeAryReduceReturn = { typesCode: string[]; methodsCode: string[]; typeNames: string[] }

export default async function addApi(moduleName: string) {
  try {
    const { detailList, classifyInfo /* todo 后续可以直接将classifyInfo集成在detail内部 */ } =
      await getInterfaceList()
    const codeAry = await Promise.all(
      detailList.map(async (detail) =>
        generateInterfaceCode(detail, {
          ...config.yapiConfig,
          classifyInfo
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
				import defHttp from '/@/utils/http/axios';
				import { ${typeNames.join(',')} } from "./model/${moduleName}.js" 
				${methodsCode.join('\n')}
			`

    console.log('typesCode', typesCode)
    console.log('completeMethodCode', completeMethodCode)

    // fsExtra.outputFileSync(`src/api/model/${moduleName}.ts`, typesCode.join('\n'))
    // fsExtra.outputFileSync(`src/api/${moduleName}.ts`, completeMethodCode)
  } catch (err) {
    console.log(err)
    // handleError(err)
  }
}
