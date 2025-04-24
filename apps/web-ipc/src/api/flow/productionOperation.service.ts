// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 工作站列表获取
 * @param params 参数
 */
export function workstationListAcquisition() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getAllWorkstations`,
  );
}
/**
 * 获取工序设备列表
 * @param params 参数
 */
export function obtainTheListOfProcessEquipment(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getAllEquipList?${qs.stringify(params)}`,
  );
}

/**
 * 用户上工
 * @param params 参数
 */
export function userUp(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/userUp`,
    params,
  );
}

/**
 * 用户下工
 * @param params 参数
 */
export function userDown(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/userDown`,
    params,
  );
}

/**
 * 一键下工
 * @param params 参数
 */
export function allClientUserDown(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/allClientUserDown`,
    params,
  );
}

/**
 * 工单操作
 * @param params 参数
 */
export function sheetWorking(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/sheet/inout/sheetWorking`,
    params,
  );
}
/**
 * 人员上下工查看（获取当前设备在工人员上工记录）
 * @param params 参数
 */
export function listUserUpInfo(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/human/patch/listUserUpInfo?${qs.stringify(params)}`,
  );
}
/**
 * 8、获取工作中心工艺路线
 * @param params 参数
 */
export function getSheetProces(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getSheetProces?${qs.stringify(params)}`,
  );
}
/**
 * 获取操作事项对应的明细内容
 * @param params 参数
 */
export function getOpFunctions(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/getOpFunctions?${qs.stringify(params)}`,
  );
}
