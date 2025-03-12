// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询生产日报
 */
export async function queryProductionDaily(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getReportDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 查询釉线日报
 */
export async function queryEnamelDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getEnamelDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 查询抛光停机日报
 */
export async function queryPGStopDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPGStopDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 * 查询窑炉日报
 */
export async function queryYLDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYLDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  粉料车间统计日报查询
 */
export async function queryYLReportDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getYLReportDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  压机日报查询
 */
export async function queryPressDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPressDayStatistics?${qs.stringify(params)}`,
  );
}
