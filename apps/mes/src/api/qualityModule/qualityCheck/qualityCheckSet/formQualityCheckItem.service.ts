// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询特殊特性设置
 */
export async function queryQcItem(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/getQcItem?${qs.stringify(params)}`,
  );
}

/**
 * 删除特殊特性设置
 * @param params
 */
export function deleteQcItem(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/deleteQcItem`,
    params,
  );
}
/**
 * 导出
 * @param params
 */
export function exportQcItem(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/export?${qs.stringify(params)}`,
  );
}
/**
 * 模糊查询  质检项列表
 * @param params
 */
export function queryQcItemList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/queryQcItem?${qs.stringify(params)}`,
  );
}
/**
 *  模糊查询  质检项编号
 * @param params
 */
export function queryQcItemByItemCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/queryQcItemByItemCode?${qs.stringify(params)}`,
  );
}

/**
 * 新增
 * @param params
 */
export function insertQcItem(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcform/addQcItem`,
    params,
  );
}
