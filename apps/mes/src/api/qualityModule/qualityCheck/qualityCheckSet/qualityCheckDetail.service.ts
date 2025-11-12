// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询特殊特性设置
 */
export function queryQualityCheckDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcDetail/query?${qs.stringify(params)}`,
  );
}

/**
 * 删除特殊特性设置
 * @param params
 */
export function deleteQualityCheckDetail(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcDetail/delete/${params}`,
  );
}
/**
 * 根据ID查询送检表单设置
 * @param params
 */
export function queryQualityCheckDetailById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcDetail/detail/${params}`,
  );
}
/**
 * 新增特殊特性设置
 * @param params
 */
export function insertQualityCheckDetail(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcDetail/save`,
    params,
  );
}

/**
 * 更新送检表单设置
 * @param params
 */
export function updateQualityCheckDetail(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcDetail/update`,
    params,
  );
}
