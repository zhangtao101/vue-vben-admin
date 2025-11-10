// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询不良代码设置
 */
export async function queryDefectCodeSet(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/productdefect/query?${qs.stringify(params)}`,
  );
}
/**
 * 导出不良代码设置
 */
export async function exportDefectCodeSet(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/productdefect/export?${qs.stringify(params)}`,
  );
}

/**
 * 删除不良代码设置
 * @param params
 */
export function deleteDefectCodeSet(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/productdefect/delete/${params}`,
  );
}
/**
 * 根据ID查询不良代码设置
 * @param params
 */
export function queryDefectCodeSetById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/productdefect/getDetail/${params}`,
  );
}

/**
 * 新增不良代码设置
 * @param params
 */
export function insertDefectCodeSet(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/productdefect/save`,
    params,
  );
}

/**
 * 更新不良代码设置
 * @param params
 */
export function updateDefectCodeSet(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/productdefect/update`,
    params,
  );
}
