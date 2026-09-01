// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询到货单列表
 * @param params - 分页及筛选参数（deliveryNo/purchaseNo/syncStatus/startDate/endDate/pageNum/pageSize）
 */
export function queryArrivalList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/arrival/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询到货单详情
 * @param params - 到货单号 arrivalNo
 */
export function queryArrivalDetail(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/arrival/detail?${qs.stringify(params)}`,
  );
}

/**
 * 手动回传到货单
 * @param params - 到货单号列表 arrivalNoList
 */
export function batchManualResend(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/arrival/batchManualResend`,
    params,
  );
}
