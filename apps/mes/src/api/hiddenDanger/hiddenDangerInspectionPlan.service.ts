// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询隐患检查计划
 */
export async function queryHiddenDangerInspectionPlan(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/plan/list?${qs.stringify(params)}`,
  );
}
/**
 * 展示所有日历
 */
export async function getWorkshopCalendars(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/workCalendar/getWorkshopCalendars?${qs.stringify(params)}`,
  );
}

/**
 * 更新隐患检查计划
 */
export async function updateHiddenDangerInspectionPlan(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/plan/update`,
    params,
  );
}

/**
 * 新增隐患检查计划
 */
export async function addHiddenDangerInspectionPlan(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/plan/insert`,
    params,
  );
}
/**
 * 是否启用计划
 */
export async function switchPlanStatus(id: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/plan/updateIsUse/${id}`,
    {},
  );
}
