// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询图表管理列表
 * @param query 查询参数
 */
export function queryEchart(query: any) {
  return requestClient.get(`/scada/echart/list?${qs.stringify(query)}`);
}

/**
 * 查询图表管理详情
 * @param id 记录ID
 */
export function queryEchartById(id: any) {
  return requestClient.get(`/scada/echart/${id}`);
}

/**
 * 新增图表管理
 * @param data 表单数据
 */
export function insertEchart(data: any) {
  return requestClient.post('/scada/echart', data);
}

/**
 * 更新图表管理
 * @param data 表单数据
 */
export function updateEchart(data: any) {
  return requestClient.put('/scada/echart', data);
}

/**
 * 删除图表管理
 * @param id 记录ID
 */
export function deleteEchart(id: any) {
  return requestClient.delete(`/scada/echart/${id}`);
}
