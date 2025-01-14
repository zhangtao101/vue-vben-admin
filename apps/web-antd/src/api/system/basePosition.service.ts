// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询岗位列表
 */
export async function listStations(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/stations?${qs.stringify(params)}`,
  );
}
/**
 * 查询岗位详情
 */
export async function queryPersonDetails(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/${id}`,
  );
}
/**
 * 删除岗位
 */
export async function deleteStation(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/${id}`,
  );
}
/**
 * 新增岗位
 */
export async function addStation(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/add`,
    params,
  );
}
/**
 * 修改岗位
 */
export async function updateStation(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/update`,
    params,
  );
}
