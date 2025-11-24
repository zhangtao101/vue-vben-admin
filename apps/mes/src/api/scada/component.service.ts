// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询组件管理列表
 * @param query 查询参数
 */
export function queryComponent(query: any) {
  return requestClient.get(`/scada/component/list?${qs.stringify(query)}`);
}

/**
 * 查询组件管理详情
 * @param id 记录ID
 */
export function queryComponentById(id: any) {
  return requestClient.get(`/scada/component/${id}`);
}

/**
 * 新增组件管理
 * @param data 表单数据
 */
export function insertComponent(data: any) {
  return requestClient.post('/scada/component', data);
}

/**
 * 更新组件管理
 * @param data 表单数据
 */
export function updateComponent(data: any) {
  return requestClient.put('/scada/component', data);
}

/**
 * 删除组件管理
 * @param id 记录ID
 */
export function deleteComponent(id: any) {
  return requestClient.delete(`/scada/component/${id}`);
}
