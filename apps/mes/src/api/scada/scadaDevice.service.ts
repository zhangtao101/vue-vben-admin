// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/* ======================== 设备基础 ======================== */

/**
 * 查询设备分页列表
 * @param query 查询参数
 */
export function queryScadaDeviceList(query: any) {
  return requestClient.get(`/iot/device/list?${qs.stringify(query)}`);
}

/**
 * 查询未授权设备分页列表
 * @param query 查询参数
 */
export function queryScadaUnAuthDeviceList(query: any) {
  return requestClient.get(`/iot/device/unAuthlist?${qs.stringify(query)}`);
}

/**
 * 查询分组可添加设备分页列表
 * @param query 查询参数
 */
export function queryScadaDeviceListByGroup(query: any) {
  return requestClient.get(`/iot/device/listByGroup?${qs.stringify(query)}`);
}

/**
 * 查询设备简短分页列表
 * @param query 查询参数
 */
export function queryScadaDeviceShortList(query: any) {
  return requestClient.get(`/iot/device/shortList?${qs.stringify(query)}`);
}

/**
 * 查询全部设备简短列表（无参）
 */
export function queryScadaAllDeviceShort() {
  return requestClient.get('/iot/device/all');
}

/**
 * 根据 deviceId 查询设备详情
 * @param deviceId 设备主键
 */
export function queryScadaDeviceById(deviceId: any) {
  return requestClient.get(`/iot/device/${deviceId}`);
}

/**
 * 根据序列号同步设备数据
 * @param serialNumber 设备序列号
 */
export function syncScadaDeviceData(serialNumber: any) {
  return requestClient.get(`/iot/device/synchronization/${serialNumber}`);
}

/**
 * 根据序列号查询设备详情
 * @param serialNumber 设备序列号
 */
export function queryScadaDeviceBySerialNumber(serialNumber: any) {
  return requestClient.get(
    `/iot/device/getDeviceBySerialNumber/${serialNumber}`,
  );
}

/**
 * 获取设备统计信息
 */
export function queryScadaDeviceStatistic() {
  return requestClient.get('/iot/device/statistic');
}

/* ======================== 设备分配 / 回收 ======================== */

/**
 * 批量分配设备到部门
 * @param deptId   目标部门 ID
 * @param deviceIds 设备 ID 数组（逗号拼接字符串）
 */
export function allotScadaDevice(deptId: any, deviceIds: any) {
  return requestClient.post(
    `/iot/device/assignment?${qs.stringify({ deptId, deviceIds })}`,
  );
}

/**
 * 批量回收设备
 * @param deviceIds 设备 ID 数组（逗号拼接字符串）
 */
export function recycleScadaDevice(deviceIds: any) {
  return requestClient.post(`/iot/device/recovery?deviceIds=${deviceIds}`);
}

/* ======================== 导入 / 回收 / 分配 记录 ======================== */

/**
 * 查询设备导入记录（URL 待补全）
 */
export function queryScadaDeviceImportRecord() {
  // 原 url 为空，按需替换真实地址
  return requestClient.get('');
}

/**
 * 查询设备回收记录（URL 待补全）
 */
export function queryScadaDeviceRecycleRecord() {
  return requestClient.get('');
}

/**
 * 查询设备分配记录（URL 待补全）
 */
export function queryScadaDeviceAllotRecord() {
  return requestClient.get('');
}

/* ======================== 运行状态 & 物模型 ======================== */

/**
 * 查询设备运行状态详情
 * @param params 查询参数
 */
export function queryScadaDeviceRunningStatus(params: any) {
  return requestClient.get(`/iot/device/runningStatus?${qs.stringify(params)}`);
}

/**
 * 获取设备物模型实时值
 * @param deviceId 设备主键
 */
export function queryScadaDeviceThingsModelValue(deviceId: any) {
  return requestClient.get(`/iot/device/thingsModelValue/${deviceId}`);
}

/* ======================== 新增 / 修改 / 删除 ======================== */

/**
 * 新增设备
 * @param data 设备信息
 */
export function insertScadaDevice(data: any) {
  return requestClient.post('/iot/device', data);
}

/**
 * 更新设备
 * @param data 设备信息
 */
export function updateScadaDevice(data: any) {
  return requestClient.put('/iot/device', data);
}

/**
 * 删除设备
 * @param deviceId 设备主键
 */
export function deleteScadaDevice(deviceId: any) {
  return requestClient.delete(`/iot/device/${deviceId}`);
}

/* ======================== 辅助接口 ======================== */

/**
 * 生成设备编号
 * @param params 生成规则参数
 */
export function generateScadaDeviceNum(params: any) {
  return requestClient.get(`/iot/device/generator?${qs.stringify(params)}`);
}

/**
 * 获取网关设备编码统计
 * @param params 查询参数
 */
export function queryScadaGwDevCode(params: any) {
  return requestClient.get(`/iot/device/gwDevCount?${qs.stringify(params)}`);
}

/**
 * 查看 MQTT 连接参数
 * @param params 查询参数
 */
export function queryScadaMqttConnect(params: any) {
  return requestClient.get(
    `/iot/device/getMqttConnectData?${qs.stringify(params)}`,
  );
}
