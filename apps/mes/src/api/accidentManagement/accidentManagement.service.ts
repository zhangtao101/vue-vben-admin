// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询事故列表
 * @param params
 */
export async function queryTheListOfAccidents(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/accident/register/list?${qs.stringify(params)}`,
  );
}
/**
 * 修改事故
 * @param params
 */
export async function updateAccidents(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/accident/register/update?${qs.stringify(params)}`,
  );
}
/**
 * 事故上报
 * @param params
 */
export async function createAccidents(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/accident/register/insert?${qs.stringify(params)}`,
  );
}
