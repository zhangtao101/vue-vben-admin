// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取仪表管理列表（电，水，气 通用）
 */
export async function selectYB(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/selectYB?${qs.stringify(params)}`,
  );
}
/**
 * 导出仪表管理列表（电，水，气 通用）
 */
export async function batchOut(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/batchOut?${qs.stringify(params)}`,
  );
}
/**
 * 仪表编号模糊查询
 */
export async function selectEquipmentCode(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/selectEquipmentCode?${qs.stringify(params)}`,
  );
}
/**
 * 单元分区下拉框
 */
export async function selectFQList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/selectFQList`,
  );
}
/**
 * 导入模板下载
 */
export async function getTheMeterTemplate() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/getTemplate`,
  );
}
/**
 * 总数信息
 */
export async function selectZXList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/selectZXList`,
  );
}
/**
 * 添加仪表管理
 */
export async function addTheMeter(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/addEquipment`,
    params,
  );
}
/**
 * 添加仪表管理
 */
export async function editTheMeter(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/editEquipment`,
    params,
  );
}
/**
 * 设备启/停用
 */
export async function updateStat(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/updateStat`,
    params,
  );
}

/**
 * 删除仪表
 */
export async function deleteTheMeter(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/Zoning/equipment/delete/${id}`,
    {},
  );
}
