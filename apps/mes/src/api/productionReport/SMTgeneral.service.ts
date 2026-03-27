// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * SMTgeneral 月度汇总
 */
export async function mouthList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/smt/produce/getMonthSum?${qs.stringify(params)}`,
  );
}

/**
 * SMTgeneral 月度汇总导出
 */
export async function mouthExelect(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/smt/produce/monthSumExport?${qs.stringify(params)}`,
  );
}

/**
 * SMTgeneral 产品汇总
 */
export async function poolList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/smt/produce/getProductSum?${qs.stringify(params)}`,
  );
}

/**
 * SMTgeneral 产品汇总导出
 */
export async function poolExect(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/smt/produce/productDaySumExport?${qs.stringify(params)}`,
  );
}

/**
 * SMTgeneral 读码报工明细
 */
export async function readList(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/getReadCodeDetailsByParams`,
    data,
  );
}

/**
 * SMTgeneral 人工报工明细
 */
export async function manList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/getWorkReportDetailsByParams?${qs.stringify(params)}`,
  );
}

/**
 * SMTgeneral 报工明细导出
 */
export async function tan_pltyExect(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/excelWorkReportPathInSMTDIP?${qs.stringify(params)}`,
  );
}

/**
 * SMTfulfil 计划汇总
 */
export async function plotList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/smt/produce/getPlanProductSum?${qs.stringify(params)}`,
  );
}

/**
 * SMTfulfil 计划汇总导出
 */
export async function plotExect(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/smt/produce/planProductDaySumExport?${qs.stringify(params)}`,
  );
}
