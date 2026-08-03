// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 设备点检计划查询参数
 */
export interface InspectionCalendarParams {
  startDate?: string;
  endDate?: string;
  equipmentGroup?: string;
  equipmentCode?: string;
  operator?: string;
}

/**
 * 设备保养计划查询参数
 */
export interface MaintenanceCalendarParams {
  startDate?: string;
  endDate?: string;
  equipmentGroup?: string;
  equipmentCode?: string;
  operator?: string;
}

/**
 * 设备点检计划查询
 * @param params 查询参数（startDate, endDate, equipmentGroup, equipmentCode, operator）
 * @returns 返回点检计划分页列表
 */
export async function searchInspectionCalendar(params: InspectionCalendarParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/calendar/searchinspection?${qs.stringify(params)}`,
  );
}

/**
 * 设备保养计划查询
 * @param params 查询参数（startDate, endDate, equipmentGroup, equipmentCode, operator）
 * @returns 返回保养计划分页列表
 */
export async function searchMaintenanceCalendar(params: MaintenanceCalendarParams) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/calendar/searchmaintenance?${qs.stringify(params)}`,
  );
}
