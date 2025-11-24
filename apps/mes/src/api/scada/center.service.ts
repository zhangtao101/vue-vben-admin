// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询组态中心列表
 * @param query 查询参数
 */
export function queryCenter(query: any) {
  return requestClient.get(`/scada/center/list?${qs.stringify(query)}`);
}

/**
 * 查询组态中心详情
 * @param id 记录ID
 */
export function queryCenterById(id: any) {
  return requestClient.get(`/scada/center/${id}`);
}

/**
 * 新增组态中心
 * @param data 表单数据
 */
export function insertCenter(data: any) {
  return requestClient.post('/scada/center', data);
}

/**
 * 更新组态中心
 * @param data 表单数据
 */
export function updateCenter(data: any) {
  return requestClient.put('/scada/center', data);
}

/**
 * 删除组态中心
 * @param id 记录ID
 */
export function deleteCenter(id: any) {
  return requestClient.delete(`/scada/center/${id}`);
}
