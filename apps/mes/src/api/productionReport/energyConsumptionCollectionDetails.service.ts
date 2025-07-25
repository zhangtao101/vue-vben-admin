// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 能耗采集明细查看
 */
export async function viewTheDetailsOfEnergyConsumptionCollection(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getEnergyConsumption?${qs.stringify(params)}`,
  );
}
/**
 * 能耗采集明细查看页面导出
 */
export async function getExcelPathEnergyConsumption(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getExcelPathEnergyConsumption?${qs.stringify(params)}`,
  );
}
/**
 * 非生产能耗明细查看页面导出
 */
export async function getExcelPathFSCEnergyConsumption(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getExcelPathFSCEnergyConsumption?${qs.stringify(params)}`,
  );
}
/**
 * 非生产能耗明细查看
 */
export async function viewNonProductionEnergyConsumptionDetails(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getFSCEnergyConsumption?${qs.stringify(params)}`,
  );
}

/**
 * 工作站名称
 */
export async function getWorkstationName() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getWorkstationName`,
  );
}

/**
 *  异常类型
 */
export async function getErrorName() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getErrorName`,
  );
}

/**
 * 工作站名称
 */
export async function getFSCEnergyConsumption() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getFSCWorkStation`,
  );
}

/**
 *  生产异常类型
 */
export async function getFSCErrorName() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getFSCErrorName`,
  );
}

/**
 * 非生产能耗采集明细页面修改
 */
export async function updateFSCEnergyConsumption(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/updateFSCEnergyConsumption`,
    params,
  );
}
