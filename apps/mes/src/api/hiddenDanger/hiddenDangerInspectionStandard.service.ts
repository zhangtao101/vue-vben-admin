// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询隐患检查类别
 */
export async function queryHiddenDangerInspectionType(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/type/list?${qs.stringify(params)}`,
  );
}

/**
 * 新增隐患检查类别
 */
export async function addHiddenDangerInspectionType(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/type/insert`,
    params,
  );
}

/**
 * 更新隐患检查类别
 */
export async function updateHiddenDangerInspectionType(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/type/update`,
    params,
  );
}
/**
 * 删除隐患检查类别
 */
export async function deleteHiddenDangerInspectionType(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/type/delete/${id}`,
  );
}
