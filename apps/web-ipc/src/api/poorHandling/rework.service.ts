// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 返工工序列表获取
 * @param params 参数
 */
export function getReworkProceList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/defect/getReworkProceList?${qs.stringify(params)}`,
  );
}

/**
 * 获取返工物料列表
 * @param params 参数
 */
export function getReworkMaterialList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/defect/getReworkMaterialList?${qs.stringify(params)}`,
  );
}

/**
 * 返工确认提交
 * @param params 参数
 */
export function reowrkConfirm(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/defect/reowrkConfirm`,
    params,
  );
}
