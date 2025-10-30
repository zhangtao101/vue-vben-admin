// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 获取条码对应的历史记录
 * @param params 参数
 */
export function listSnCodeHistory(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listSnCodeHistory?${qs.stringify(params)}`,
  );
}
/**
 * 条码执行步骤明细查看
 * @param params 参数
 */
export function listSnCodeOpLog(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/listSnCodeOpLog?${qs.stringify(params)}`,
  );
}
/**
 * 改派
 * @param params 参数
 */
export function snCodeIdReCheck(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/opfunction/snCodeIdReCheck`,
    params,
  );
}
