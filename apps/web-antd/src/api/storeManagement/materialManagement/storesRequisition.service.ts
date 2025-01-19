// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询领料申请单
 * @param params
 */
export function queryStoreRequisition(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/search?${qs.stringify(params)}`,
  );
}
/**
 * 查询领料申请单
 */
export function queryStoreRequisitionTyle() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/typeList`,
  );
}
