// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询送检表单设置
 */
export async function queryQualityCheckForm(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/query?${qs.stringify(params)}`,
  );
}
/**
 * 导出送检表单设置
 */
export async function exportQualityCheckForm(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/export?${qs.stringify(params)}`,
  );
}

/**
 * 删除送检表单设置
 * @param params
 */
export function deleteQualityCheckForm(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/delete/${params}`,
  );
}
/**
 * 根据ID查询送检表单设置
 * @param params
 */
export function queryQualityCheckFormById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/detail//${params}`,
  );
}

/**
 * 新增特殊特性设置
 * @param params
 */
export function insertQualityCheckForm(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/save`,
    params,
  );
}

/**
 * 更新送检表单设置
 * @param params
 */
export function updateQualityCheckForm(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/update`,
    params,
  );
}
