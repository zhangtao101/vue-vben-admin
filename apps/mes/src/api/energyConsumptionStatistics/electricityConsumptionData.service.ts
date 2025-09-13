// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取电表读数-小时
 */
export async function getHourYBList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/PowerData/getHourYBList?${qs.stringify(params)}`,
  );
}

/**
 * 获取电表读数-日
 */
export async function getDayYBList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/PowerData/getDayYBList?${qs.stringify(params)}`,
  );
}

/**
 * 获取电表读数-月
 */
export async function getMonthYBList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/PowerData/getMonthYBList?${qs.stringify(params)}`,
  );
}
/**
 * 获取电表读数-年
 */
export async function getYearYBList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/PowerData/getYearYBList?${qs.stringify(params)}`,
  );
}
