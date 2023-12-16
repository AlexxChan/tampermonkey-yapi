import { get } from '../utils/request'
import { ClassifyListResponse, InterfaceDetailResponse } from './model/core'

/**
 * 获取分类下的接口列表
 * @param {string} catid 分类id
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export function getInterfaceListByClassify(catid: string) {
  return get<ClassifyListResponse>('/api/interface/list_cat', {
    page: 1,
    limit: 1000,
    catid: catid
  })
}

/**
 * 获取接口数据
 * @param {string} id
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export function getInterfaceDetail(id: string | number) {
  return get<InterfaceDetailResponse>('/api/interface/get', {
    id
  })
}

/**
 * 获取分类下的所有接口详情
 */
export async function getClassifyAllInterfaceDetail(classifyId: string) {
  const res = await getInterfaceListByClassify(classifyId)
  const list = res.data?.list
  const resList = await Promise.all(list.map((api) => getInterfaceDetail(api._id)))
  return resList.map((item) => item.data)
  // const list = res.
}
