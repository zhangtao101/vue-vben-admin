// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取工单入库记录
 */
export async function getInWarehouseHistoryList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/getInWarehouseHistoryList?${qs.stringify(params)}`,
  );
}
/**
 * 获取工单入库记录
 */
export async function getAllInWarehouseList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/getAllInWarehouseList?${qs.stringify(params)}`,
  );
}
/**
 * 获取工单入库记录
 */
export async function getAllOutWarehouseList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/getAllOutWarehouseList?${qs.stringify(params)}`,
  );
}

/**
 * 入库冲销
 */
export async function callbackInout(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/callbackInout`,
    params,
  );
}

/**
 * 入库冲销
 */
export async function callbackOut(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/callbackOut`,
    params,
  );
}
