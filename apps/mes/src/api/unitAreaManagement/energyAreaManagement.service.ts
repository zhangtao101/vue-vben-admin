// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 用能分区列表查询
 */
export async function getEnergyZoningList(queryParams: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/getEnergyZoningList?${qs.stringify(queryParams)}`,
  );
}
/**
 * 用能分区名称检验
 */
export async function getEnergyZoningPartitionName(queryParams: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/getEnergyZoningPartitionName?${qs.stringify(queryParams)}`,
  );
}

/**
 * 用能分区ID检验
 */
export async function getEnergyZoningPartitionID(queryParams: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/getEnergyZoningPartitionID?${qs.stringify(queryParams)}`,
  );
}

/**
 * 用能上级分区选择列表
 */
export async function getParentPartitionName() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/getParentPartitionName`,
  );
}

/**
 * 用能分区导入模板下载
 */
export async function getTemplate() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/getTemplate`,
  );
}

/**
 * 用能分区列表导出
 */
export async function getExcelPathEnergyZoningList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/getExcelPathEnergyZoningList`,
  );
}

/**
 * 用能分区删除
 */
export async function deleteEnergyZoning(queryParams: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/delete/${queryParams}`,
  );
}
/**
 * 用能分区列表添加
 */
export async function addEnergyZoningList(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/addEnergyZoningList`,
    params,
  );
}
/**
 * 用能分区导入
 */
export async function energyPartitionImport(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/upload`,
    params,
  );
}
/**
 * 用能分区编辑
 */
export async function updateEnergyZoning(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyZoning/updateEnergyZoning`,
    params,
  );
}
