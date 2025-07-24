// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取区域列表
 */
export async function areaList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/basic/area/list?${qs.stringify(params)}`,
  );
}

/**
 * 新增区域
 */
export async function addArea(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/basic/position/insert`,
    params,
  );
}

/**
 * 编辑区域
 */
export async function updateArea(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/basic/area/update`,
    params,
  );
}
/**
 * 删除区域
 */
export async function deleteArea(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/basic/area/delete/${params.id}`,
    params,
  );
}
