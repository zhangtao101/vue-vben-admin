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

/**
 * 获取工步类型列表
 */
export async function listOpFunctionType() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/listOpFunctionType`,
  );
}

/**
 * 工步新增
 */
export async function insertOpFunctionSet(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/insertOpFunctionSet`,
    params,
  );
}

/**
 * 工步编辑
 */
export async function updateOpFunctionSet(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/updateOpFunctionSet`,
    params,
  );
}

/**
 * 顺序变更
 */
export async function updateOpList(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/updateOpList`,
    params,
  );
}
/**
 * 删除工步
 */
export async function deleteStepsFunction(id: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/deleteById/${id}`,
  );
}

/**
 * 执行设置查询
 */
export async function performASetupQuery(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/opinfo/listFunctionOpinfo?${qs.stringify(params)}`,
  );
}
/**
 * 工序配方查询
 */
export async function listCatchTemplateDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/opinfo/listCatchTemplateDetail?${qs.stringify(params)}`,
  );
}

/**
 * 新增运行设置
 */
export async function insertFunctionOpinfo(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/opinfo/insertFunctionOpinfo`,
    params,
  );
}
/**
 * 编辑运行设置
 */
export async function updateFunctionOpinfo(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/opinfo/updateFunctionOpinfo`,
    params,
  );
}
/**
 * 运行设置状态切换
 */
export async function runSettingUpdateStatus(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/opinfo/stopOrUse`,
    params,
  );
}
/**
 * 运行设置审核
 */
export async function runSettingAudit(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/opinfo/audit`,
    params,
  );
}

/**
 * 删除运行设置
 */
export async function deleteSRunSetting(id: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/functionset/opinfo/deleteById/${id}`,
  );
}
