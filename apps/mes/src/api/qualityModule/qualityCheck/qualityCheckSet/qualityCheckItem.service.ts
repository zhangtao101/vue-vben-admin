// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询特殊特性设置
 */
export async function queryFormQualityCheckItem(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcItem/query?${qs.stringify(params)}`,
  );
}

/**
 * 删除特殊特性设置
 * @param params
 */
export function deleteFormQualityCheckItem(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcItem/delete/${params}`,
  );
}
/**
 * 根据ID查询送检表单设置
 * @param params
 */
export function queryFormQualityCheckItemById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcItem/detail/${params}`,
  );
}

/**
 * 新增特殊特性设置
 * @param params
 */
export function insertFormQualityCheckItem(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcItem/save`,
    params,
  );
}

/**
 * 更新送检表单设置
 * @param params
 */
export function updateFormQualityCheckItem(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcItem/update`,
    params,
  );
}
