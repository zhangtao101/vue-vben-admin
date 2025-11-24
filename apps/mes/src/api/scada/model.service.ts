// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询模型管理列表
 * @param query 查询参数
 */
export function queryModel(query: any) {
  return requestClient.get(`/scada/model/list?${qs.stringify(query)}`);
}

/**
 * 查询模型管理详情
 * @param id 记录ID
 */
export function queryModelById(id: any) {
  return requestClient.get(`/scada/model/${id}`);
}

/**
 * 新增模型管理
 * @param data 表单数据
 */
export function insertModel(data: any) {
  return requestClient.post('/scada/model', data);
}

/**
 * 更新模型管理
 * @param data 表单数据
 */
export function updateModel(data: any) {
  return requestClient.put('/scada/model', data);
}

/**
 * 删除模型管理
 * @param id 记录ID
 */
export function deleteModel(id: any) {
  return requestClient.delete(`/scada/model/${id}`);
}
