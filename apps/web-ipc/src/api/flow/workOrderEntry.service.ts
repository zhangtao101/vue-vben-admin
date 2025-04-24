// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 工单管理列表获取
 * @param params 参数
 */
export function obtainTheWorkOrderManagementList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/getAllSendList?${qs.stringify(params)}`,
  );
}
/**
 * 获取工单列表
 * @param params 参数
 */
export function obtainTheWorkOrderList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getAllSheetList?${qs.stringify(params)}`,
  );
}
/**
 * 移出
 * @param params 参数
 */
export function moveOut(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/moveOut`,
    params,
  );
}
/**
 * 移入
 * @param params 参数
 */
export function moveIn(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/moveIn`,
    params,
  );
}
/**
 * 排序
 * @param params 参数
 */
export function moveUpAndDown(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/updateList`,
    params,
  );
}
/**
 * 进站
 * @param params 参数
 */
export function inputSheet(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/inputSheet`,
    params,
  );
}
/**
 * 删除
 * @param params 参数
 */
export function deleteWorksheet(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/deleteWorksheet`,
    params,
  );
}
