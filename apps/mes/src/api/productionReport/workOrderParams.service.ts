// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 获取数采绑定工单列表
 */
export async function listDataCatchWorksheetState(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/listDataCatchWorksheetState?${qs.stringify(params)}`,
  );
}
/**
 * 获取数采设备列表
 */
export async function listDataCatchEquip(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/listDataCatchEquip?${qs.stringify(params)}`,
  );
}
/**
 * 获取绑定列表
 */
export async function listDataCatchDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/listDataCatchDetail?${qs.stringify(params)}`,
  );
}
/**
 * 查看数采参数列表
 */
export async function listEquipCatchData(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/listEquipCatchData?${qs.stringify(params)}`,
  );
}

/**
 * 绑定数采
 */
export async function worksheetDatacatchBinding(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/worksheetDatacatchBinding`,
    params,
  );
}
