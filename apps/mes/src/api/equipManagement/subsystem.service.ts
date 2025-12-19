// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分项列表查询
 */
export async function getItemizedSystemList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/getItemizedSystemList?${qs.stringify(params)}`,
  );
}
/**
 * 分项列表导出
 */
export async function getExcelPathItemizedSystemList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/getExcelPathItemizedSystemList?${qs.stringify(params)}`,
  );
}
/**
 * 系统编号检测
 */
export async function checkSystemNumber(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/checkSystemNumber?${qs.stringify(params)}`,
  );
}
/**
 * 系统名称检测
 */
export async function checkSystemName(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/checkSystemName?${qs.stringify(params)}`,
  );
}
/**
 * 分项仪表查询
 */
export async function selectEquipment(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/selectEquipment?${qs.stringify(params)}`,
  );
}
/**
 * 导入模板下载
 */
export async function getItemizedSystemTemplate() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/getTemplate`,
  );
}
/**
 * 获取分项系统类型
 */
export async function getSystemType() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/getSystemType`,
  );
}
/**
 * 添加分项列表
 */
export async function addItemizedSystemList(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/addItemizedSystemList`,
    params,
  );
}
/**
 * 编辑分项列表
 */
export async function updateItemizedSystemList(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/updateItemizedSystemList`,
    params,
  );
}
/**
 * 分项仪表停用/启用
 */
export async function stopItemizedSystem(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/stopItemizedSystem`,
    params,
  );
}
/**
 * 38、配置分项仪表
 */
export async function editorEquipment(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/editorEquipment`,
    params,
  );
}
/**
 * 38、配置分项仪表
 */
export async function editorTeamEnergyConsumption(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/editorEquipment`,
    params,
  );
}

/**
 * 分项列表删除
 */
export async function deleteItemizedSystem(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/ItemizedSystem/Delete/${id}`,
    {},
  );
}
