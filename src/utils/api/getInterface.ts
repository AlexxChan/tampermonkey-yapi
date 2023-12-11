// import { askList } from '../../../utils/common/ask.js'
import { config } from '../../const/config'
import { ListReturnInfo } from '../formatTs/type.js'
import getYapiRequest from './request.js'

// alex yapi文档
const yapiMethods = getYapiRequest(config.yapiConfig)

async function getApiDetailList(apiList: ListReturnInfo[]) {
  const resList = await Promise.all(apiList.map((api) => yapiMethods.queryDetail(api._id)))
  return resList.map((item) => item.data)
}

// 获取分类下的所有接口信息
export async function getInterfaceList() {
  const { data: classifyList } = await yapiMethods.queryClassify()
  // const classifyId = await askList({
  //   message: '请选择要使用的分类',
  //   choices: classifyList.map((item: { name: string; _id: string }) => ({
  //     name: item.name,
  //     value: item._id
  //   }))
  // })
  const classifyId = '3371'
  const {
    data: { list: apiList }
  } = await yapiMethods.queryApiList(classifyId)
  const detailList = await getApiDetailList(apiList)
  return {
    detailList,
    classifyInfo: classifyList.find((item: { _id: string }) => item._id === classifyId)
  }
}

/**
 * 获取对应接口
 * @return {Promise<string>}
 */
export async function getInterface() {
  const { detailList } = await getInterfaceList()
  const interfaceId = '65347'
  // const interfaceId = await askList({
  //   message: '请选择对应的接口',
  //   choices: detailList.map((item) => ({
  //     name: item.title,
  //     value: item._id
  //   }))
  // })
  return detailList.find((item) => item._id === +interfaceId)!
}
