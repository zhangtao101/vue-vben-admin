// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 本日计划与完成情况 表格加载
 */
export async function fetchList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/searchWorkSheetDayFinishSituation?${qs.stringify(params)}`,
  );
}

/**
 * 本日计划与完成情况 导出
 */
export async function exportList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/searchWorkSheetDayFinishSituationPath?${qs.stringify(params)}`,
  );
}

/**
 * 新增信息
 */
export async function createArticle(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/insertWorkReport`,
    data,
  );
}

/**
 * 读码报工的明细
 */
export async function fetParams(data: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/getQrcodeDetailsByWorkCode`,
    data,
  );
}

/**
 * 人工报工明细
 */
export async function fetchDetailByName(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/getDetailsByParams?${qs.stringify(params)}`,
  );
}

/**
 * 根据产品名称导出报工明细
 */
export async function exportDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/report/detail/excelPathInPersonReport?${qs.stringify(params)}`,
  );
}

/**
 * 查询工单
 */
export async function fetchWorkorder(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/search/reportRecord?${qs.stringify(params)}`,
  );
}

/**
 * 查询车间下的工序
 */
export async function fetchProcessByWorkshop(workshop: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/list/line/${workshop}`,
  );
}

/**
 * 查询工序下对应的产线
 */
export async function fetchLineById(processId: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/Line/list/process/${processId}`,
  );
}
