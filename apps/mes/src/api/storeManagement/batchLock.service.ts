// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取批次锁定相关明细列表
 * @param params
 */
export function materialRecordListBatchLock(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/materialRecord/listBatchLock?${qs.stringify(params)}`,
  );
}
/**
 * 锁定/解锁/标记 批次
 * @param params
 */
export function materialRecordBatchLock(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/materialRecord/batchLock`,
    params,
  );
}
