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
/**
 *  抛光产量日报查询
 */
export async function queryPolishingYieldDayStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getPolishingYieldDayStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  粉料移交报表查询
 */
export async function queryFLTransferStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getFLTransferStatistics?${qs.stringify(params)}`,
  );
}
/**
 *  能源报表查询
 */
export async function queryEnergyConsumptionStatistics(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getEnergyConsumptionStatistics?${qs.stringify(params)}`,
  );
}

// region 报表导出
/**
 * 压机日报导出
 */
export async function excelPathPressDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPressDay?${qs.stringify(params)}`,
  );
}
/**
 * 窑炉日报导出
 */
export async function excelPathYLDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYLDay?${qs.stringify(params)}`,
  );
}
/**
 * 釉线日报导出
 */
export async function excelPathEnamelDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathEnamelDay?${qs.stringify(params)}`,
  );
}
/**
 * 抛光产量日报导出
 */
export async function excelPathPolishingYieldDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathPolishingYieldDay?${qs.stringify(params)}`,
  );
}
/**
 * 料车间工单生产日报导出
 */
export async function excelPathYLReportDay(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/report/statistics/getExcelPathYLReportDay?${qs.stringify(params)}`,
  );
}
// endregion
