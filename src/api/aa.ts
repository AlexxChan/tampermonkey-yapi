/**
 * 接口 [人员信息删除↗](http://10.1.1.191:3000/project/3371/interface/api/5544338) 的 **请求函数**
 *
 * @分类 [undefined↗](http://10.1.1.191:3000/project/3371/interface/api/cat_undefined)
 * @标签 人员管理
 * @请求头 POST
 * @创建人 Aelx
 * @更新时间 2023-12-10 22:15:23
 */
export const batchDelete = /*#__PURE__*/ (data: BatchDeleteRequest) => {
  return defHttp.request<BatchDeleteResponse>({
    url: '/api/system/people/batch/delete',
    method: 'POST',
    data
  })
}
