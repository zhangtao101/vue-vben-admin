// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询组态中心已绑定设备列表
 * @param query 查询参数
 */
export function queryDeviceBind(query: any) {
  return requestClient.get(
    `/scada/center/listDeviceBind?${qs.stringify(query)}`,
  );
}

/**
 * 保存组态与设备绑定关系
 * @param data 绑定数据
 */
export function insertDeviceBind(data: any) {
  return requestClient.post('/scada/center/saveDeviceBind', data);
}

/**
 * 移除组态与设备绑定关系
 * @param ids 绑定记录ID，多个用逗号分隔
 */
export function deleteDeviceBind(ids: any) {
  return requestClient.delete(`/scada/center/removeDeviceBind/${ids}`);
}

/**
 * 获取设备统计信息
 */
export function queryDeviceStatistic() {
  return requestClient.get('/scada/center/statistic');
}

/**
 * 查询设备物模型变量列表
 * @param query 查询参数
 */
export function queryDeviceThingsModel(query: any) {
  return requestClient.get(
    `/scada/center/listDeviceThingsModel?${qs.stringify(query)}`,
  );
}

/**
 * 根据 GUID 获取组态详情
 * @param guid 组态全局唯一标识
 */
export function queryCenterByGuid(guid: any) {
  return requestClient.get(`/scada/center/getByGuid?guid=${guid}`);
}

/**
 * 保存组态详情（画布、节点、连线等）
 * @param data 完整组态数据
 */
export function insertCenterDetail(data: any) {
  return requestClient.post('/scada/center/save', data);
}

/**
 * 取消收藏图库
 * @param id 收藏记录ID
 */
export function deleteGalleryFavorites(id: any) {
  return requestClient.delete(`/scada/center/deleteGalleryFavorites/${id}`);
}

/**
 * 收藏图库
 * @param data 收藏数据 { galleryId, ... }
 */
export function insertGalleryFavorites(data: any) {
  return requestClient.post('/scada/center/saveGalleryFavorites', data);
}

/**
 * 查询我的收藏图库列表
 * @param query 查询参数
 */
export function queryGalleryFavorites(query: any) {
  return requestClient.get(
    `/scada/center/listGalleryFavorites?${qs.stringify(query)}`,
  );
}

/**
 * 获取物模型历史数据
 * @param data 查询条件 { deviceId, identifier, startTime, endTime }
 */
export function queryThingsModelHistory(data: any) {
  return requestClient.post('/scada/center/listThingsModelHistory', data);
}

/**
 * 获取设备实时状态
 * @param query 查询参数 { deviceId }
 */
export function queryDeviceStatus(query: any) {
  return requestClient.get(
    `/scada/center/getDeviceStatus?${qs.stringify(query)}`,
  );
}
