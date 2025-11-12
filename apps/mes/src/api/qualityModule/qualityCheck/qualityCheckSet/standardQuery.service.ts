// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询质检标准列表
 * @param query 查询参数
 */
export function queryQualityCheckStandard(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcStandard/query?${qs.stringify(query)}`,
  );
}
/**
 * 查询质检标准产品
 * @param query 查询参数
 */
export function queryStandardProduct(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcStandard/getProduct?${qs.stringify(query)}`,
  );
}

/**
 * 导出质检标准列表
 * @param query 查询参数
 */
export function exportQualityCheckStandard(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/qcStandard/export?${qs.stringify(query)}`,
  );
}

/**
 * 查询度量方法列表
 */
export function queryMeasureMethodList() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/measuremethod/queryList`,
  );
}
