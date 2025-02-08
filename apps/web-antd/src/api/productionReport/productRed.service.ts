// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 条件查询所有工序
 */
export async function queryProcessList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/list/param?${qs.stringify(params)}`,
  );
}
/**
 * 查询工序下对应的产线
 */
export async function queryProcess(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/list/process/${params}`,
  );
}

/**
 * 查询工单完成情况
 * @param params
 */
export async function searchWorkSheetFinishSituation(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/searchWorkSheetFinishSituation?${qs.stringify(params)}`,
  );
}
/**
 * 查询详情
 * @param params
 */
export async function getWorkSheetFinishSituationDetailsByWorkCode(
  params: any,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/getDetailsByWorkCode?${qs.stringify(params)}`,
  );
}

/**
 * 导出工单完成情况
 * @param params
 */
export async function exportWorkSheetFinishSituation(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/searchWorkSheetFinishSituationPath?${qs.stringify(params)}`,
  );
}

/**
 * 冲红
 */
export async function worksheetReportUpdate(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/worksheetReportUpdate`,
    params,
  );
}
