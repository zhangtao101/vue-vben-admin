// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取班组管理列表
 */
export async function getClassControllerList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getClassControllerList?${qs.stringify(params)}`,
  );
}

/**
 * 检测班组名称是否存在
 */
export async function checkClassName(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/checkClassName?${qs.stringify(params)}`,
  );
}

/**
 * 检测班组编号是否存在
 */
export async function checkClassNumber(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/checkClassNumber?${qs.stringify(params)}`,
  );
}
/**
 * 日能耗
 */
export async function getDayClassEnergy(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getDayClassEnergy?${qs.stringify(params)}`,
  );
}
/**
 * 月能耗
 */
export async function getMonthClassEnergy(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getMonthClassEnergy?${qs.stringify(params)}`,
  );
}
/**
 * 年能耗
 */
export async function getYearClassEnergy(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getYearClassEnergy?${qs.stringify(params)}`,
  );
}

/**
 * 获取班组名称列表
 */
export async function getClassNameList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/getClassNameList`,
  );
}

/**
 * 删除班组管理列表
 */
export async function deleteClassController(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/DeleteClassController?${qs.stringify(params)}`,
  );
}

/**
 * 添加班组管理列表
 */
export async function insertClassController(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/insertClassController`,
    params,
  );
}

/**
 * 编辑班组管理列表
 */
export async function updateClassController(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/energyEfficiencyAnalysis/updateClassController`,
    params,
  );
}
