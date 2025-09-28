// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询日历
 */
export function getPlantCalendarList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/workCalendar/getWorkshopCalendars?${qs.stringify(params)}`,
  );
}

/**
 * 删除日历
 */
export function deletePlantCalendar(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/workCalendar/delete?${qs.stringify(params)}`,
    {},
  );
}
/**
 * 新增日历
 */
export function addPlantCalendar(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/workCalendar/insert`,
    params,
  );
}
/**
 * 修改日历
 */
export function updatePlantCalendar(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/workCalendar/update`,
    params,
  );
}
/**
 * 根据id查询详情
 */
export function getPlantCalendarDetail(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/workCalendar/getById?${qs.stringify(params)}`,
  );
}
