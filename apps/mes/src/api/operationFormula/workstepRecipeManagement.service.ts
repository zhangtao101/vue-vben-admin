// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工步配方列表
 */
export async function listEquipOpFormula(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/formula/listEquipOpFormula?${qs.stringify(params)}`,
  );
}
/**
 * 删除工步配方
 */
export async function deleteSteps(id: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/formula/deleteById/${id}`,
  );
}
/**
 * 状态切换
 */
export async function stepStateSwitching(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/formula/stopOrUse`,
    params,
  );
}
/**
 * 新增
 */
export async function insertEquipOpFormula(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/formula/insertEquipOpFormula`,
    params,
  );
}
/**
 * 编辑
 */
export async function updateEquipOpFormula(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/formula/updateEquipOpFormula`,
    params,
  );
}
/**
 * 匹配
 */
export async function matching(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/formula/matchStationOpDetailById?${qs.stringify(params)}`,
  );
}

/**
 * 绑定工步查询
 */
export async function bindStepQuery(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/listOpFunctionSet?${qs.stringify(params)}`,
  );
}
