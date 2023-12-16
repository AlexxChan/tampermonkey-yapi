import { Interface } from '../../utils/formatTs/type'

export interface ClassifyListResponseData {
  count: number
  total: number
  list: InterfaceListItem[]
}

export interface InterfaceListItem {
  edit_uid: number
  status: string
  api_opened: boolean
  tag: string[]
  _id: number
  method: string
  title: string
  path: string
  project_id: number
  catid: number
  uid: number
  add_time: number
}

export interface ClassifyListResponse {
  errcode: number
  errmsg: string
  data: ClassifyListResponseData
}

/**
 * 详情相关
 */

export interface QueryPath {
  path: string
  params: any[]
}

export interface InterfaceDetail {
  query_path: QueryPath
  edit_uid: number
  status: string
  type: string
  req_body_is_json_schema: boolean
  res_body_is_json_schema: boolean
  api_opened: boolean
  index: number
  tag: string[]
  _id: number
  method: string
  title: string
  desc: string
  path: string
  req_params: any[]
  req_body_form: any[]
  req_headers: ReqHeader[]
  req_query: any[]
  req_body_type: string
  res_body_type: string
  res_body: string
  req_body_other: string
  project_id: number
  catid: number
  uid: number
  add_time: number
  up_time: number
  __v: number
  username: string
}

export interface ReqHeader {
  required: string
  _id: string
  name: string
  value: string
}

export interface InterfaceDetailResponse {
  errcode: number
  errmsg: string
  data: InterfaceDetail
}
