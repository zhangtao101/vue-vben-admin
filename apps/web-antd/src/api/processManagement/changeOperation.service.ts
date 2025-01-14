// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 *查询变更单列表
 */
export async function queryChange(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/change/queryList?${qs.stringify(params)}`,
  );
}
/**
 *查询变更单明细
 */
export async function queryChangeDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/change/getUseListById?id=${params}`,
  );
}
/**
 * 变更应用
 */
export async function changeUse(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/change/changeUse`,
    params,
  );
}
