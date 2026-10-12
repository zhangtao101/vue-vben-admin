// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * SMT车间产品不良一览月汇总
 * @param params 查询参数
 */
export async function queryDefectMonthSummary(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/quality/discoveryDefect/month?${qs.stringify(params)}`,
  );
}

/**
 * SMT车间产品不良一览月汇总导出
 * @param params 查询参数
 */
export async function exportDefectMonthSummary(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/quality/discoveryDefect/month/export?${qs.stringify(params)}`,
  );
}

/**
 * SMT车间月产品不良明细
 * @param params 查询参数
 */
export async function queryDefectDaySummary(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/quality/discoveryDefect/day?${qs.stringify(params)}`,
  );
}

/**
 * SMT车间月产品不良明细导出
 * @param params 查询参数
 */
export async function exportDefectDaySummary(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/quality/discoveryDefect/day/export?${qs.stringify(params)}`,
  );
}

/**
 * 缺陷不良明细
 * @param params 查询参数
 */
export async function queryDefectDetailList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/quality/discoveryDefect/getDefectDetail?${qs.stringify(params)}`,
  );
}

/**
 * 缺陷不良明细导出
 * @param params 查询参数
 */
export async function exportDefectDetailList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/quality/discoveryDefect/defectDetail/export?${qs.stringify(params)}`,
  );
}

/**
 * 根据车间获取车间下的生产线
 * @param params 查询参数
 */
export async function queryLineByWorkshop(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/getByWorkshop?${qs.stringify(params)}`,
  );
}

/**
 * 发现工序下拉
 * @param params 查询参数
 */
export async function queryDiscoveryProcess(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/getDiscoveryProcess?${qs.stringify(params)}`,
  );
}
