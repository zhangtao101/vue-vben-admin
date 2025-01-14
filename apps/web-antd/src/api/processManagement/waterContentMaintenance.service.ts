// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取待维护工单列表
 */
export async function searchWorksheetNoWater(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/searchWorksheetNoWater?${qs.stringify(params)}`,
  );
}
/**
 * 根据工单料号获取对应的含水率记录
 */
export async function getByWorksheetCodeAndMaterialCode(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/getByWorksheetCodeAndMaterialCode?${qs.stringify(params)}`,
  );
}

/**
 * 根据工单号获取BOM列表
 */
export async function listPlanMaterialByWorksheetCode(params: any) {
  // https://v507z46671.yicp.fun/mes-main/worksheet/water/listPlanMaterialByWorksheetCode
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/listPlanMaterialByWorksheetCode?${qs.stringify(params)}`,
  );
}
/**
 * 删除
 */
export async function waterDelete(params: any) {
  // https://v507z46671.yicp.fun/mes-main/worksheet/water/listPlanMaterialByWorksheetCode
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/waterDelete?${qs.stringify(params)}`,
  );
}
/**
 * 新增
 */
export async function waterSave(params: any) {
  // https://v507z46671.yicp.fun/mes-main/worksheet/water/listPlanMaterialByWorksheetCode
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/waterSave`,
    params,
  );
}
/**
 * 编辑
 */
export async function waterUpdate(params: any) {
  // https://v507z46671.yicp.fun/mes-main/worksheet/water/listPlanMaterialByWorksheetCode
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/worksheet/water/waterUpdate`,
    params,
  );
}
