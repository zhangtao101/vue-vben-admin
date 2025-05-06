// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 岗位名称的模糊查询接口
 */
export async function stationLikeName(name: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/likeName/${name}`,
  );
}
/**
 * 查询组织
 */
export async function listSysStation(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/stations?${qs.stringify(params)}`,
  );
}
/**
 * 删除组织
 */
export async function delSysStation(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/${id}`,
  );
}
/**
 * 新增组织
 */
export async function addSysStation(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/add`,
    params,
  );
}
/**
 * 编辑组织
 */
export async function updateSysStation(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/update`,
    params,
  );
}

/**
 * 查看详情
 */
export async function querySysStationDetails(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/station/${id}`,
  );
}
