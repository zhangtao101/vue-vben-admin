// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取用水数据列表 - 月
 */
export async function getMonthWaterUsageDataList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/WaterUsageData/getMonthWaterUsageDataList?${qs.stringify(params)}`,
  );
}
/**
 * 获取用水数据列表 - 年
 */
export async function getYearWaterUsageDataList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/WaterUsageData/getYearWaterUsageDataList?${qs.stringify(params)}`,
  );
}

/**
 * 获取用气数据列表 - 月
 */
export async function getMonthGasUseDataList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/WaterUsageData/getMonthGasUseDataList?${qs.stringify(params)}`,
  );
}
/**
 * 获取用气数据列表 - 年
 */
export async function getYearGasUseDataList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/WaterUsageData/getYearGasUseDataList?${qs.stringify(params)}`,
  );
}
