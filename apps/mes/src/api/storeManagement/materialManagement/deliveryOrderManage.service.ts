// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询送货单列表
 * @param params - 分页及筛选参数（pageNum/pageSize/deliveryNo/itemNo/startDeliveryDate/endDeliveryDate/arrivalState）
 */
export function queryDeliveryList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/srm/delivery/list?${qs.stringify(params)}`,
  );
}

/**
 * 查询送货单详情
 * @param deliveryNo - 送货单号
 * @param params - 企业编号 ent、营运据点 site
 */
export function queryDeliveryDetail(deliveryNo: string, params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/srm/delivery/detail/${deliveryNo}?${qs.stringify(params)}`,
  );
}

/**
 * 确认收货
 * @param params - selectList 送货单列表（ent/site/deliveryNo）、receiveRemark 收货备注
 */
export function batchConfirmReceipt(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/arrival/batchConfirmReceipt`,
    params,
  );
}
