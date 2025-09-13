// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 用水/气录入
 */
export async function energyInsert(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/EnergyInsert/insert`,
    params,
  );
}
/**
 * 仪表下拉框
 */
export async function gaugeDropDownBox(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/EnergyInsert/selectYB?${qs.stringify(params)}`,
  );
}
