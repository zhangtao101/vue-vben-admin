// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询设备告警分页列表
 * @param query 查询参数
 */
export function queryScadaAlertLogList(query: any) {
  return requestClient.get(`/iot/alertLog/list?${qs.stringify(query)}`);
}

/**
 * 根据 ID 查询设备告警详情
 * @param alertLogId 告警主键
 */
export function queryScadaAlertLogById(alertLogId: any) {
  return requestClient.get(`/iot/alertLog/${alertLogId}`);
}

/**
 * 新增设备告警记录
 * @param data 告警数据
 */
export function insertScadaAlertLog(data: any) {
  return requestClient.post('/iot/alertLog', data);
}

/**
 * 更新设备告警记录
 * @param data 告警数据
 */
export function updateScadaAlertLog(data: any) {
  return requestClient.put('/iot/alertLog', data);
}

/**
 * 删除设备告警记录
 * @param alertLogId 告警主键
 */
export function deleteScadaAlertLog(alertLogId: any) {
  return requestClient.delete(`/iot/alertLog/${alertLogId}`);
}
