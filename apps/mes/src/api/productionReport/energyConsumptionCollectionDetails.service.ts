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
 * 非生产能耗明细查看
 */
export async function viewNonProductionEnergyConsumptionDetails(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/energy/detail/getFSCEnergyConsumption?${qs.stringify(params)}`,
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
