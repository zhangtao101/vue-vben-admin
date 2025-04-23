// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 获取出站工单列表
 * @param params 参数
 */
export function obtainTheListOfOutgoingWorkOrders(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/getAllWorkingList?${qs.stringify(params)}`,
  );
}
/**
 * 报工出站
 * @param params 参数
 */
export function reportToWorkAndLeaveTheStation(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/outputSheet`,
    params,
  );
}
