// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 手填新增 / 保存草稿
 * @param params
 */
export async function handAddition(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/insert`,
    params,
  );
}
/**
 * 安灯呼叫
 * @param params
 */
export async function onLightCall(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/insertself`,
    params,
  );
}
/**
 * 安灯记录查询
 * @param params
 */
export async function lampInstallationRecordQuery(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/listByProcess?${qs.stringify(params)}`,
  );
}
/**
 * 设备编号模糊查询
 * @param params
 */
export async function fuzzyQueryOfEquipmentNumber(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/equipmentLedger/fuzzyQueryByequipmentCode?${qs.stringify(params)}`,
  );
}
/**
 * 显示缓存
 * @param params
 */
export async function displayCache(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/listByDraft?${qs.stringify(params)}`,
  );
}
/**
 * 工单编号模糊查询
 * @param params
 */
export async function fuzzyQueryOfWorkOrderNumbers(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/plan/worksheet/search?${qs.stringify(params)}`,
  );
}
/**
 * 草稿箱记录查询
 * @param params
 */
export async function draftBoxRecordQuery(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/listByDraft?${qs.stringify(params)}`,
  );
}

/**
 * 安灯评价列表查询
 * @param params
 */
export async function evaluationListQuery(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/listByEvaluate?${qs.stringify(params)}`,
  );
}
/**
 * 问题待判定页面显示数据
 * @param params
 */
export async function queryTheListOfAndonPendingProcessing(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/listByUser?${qs.stringify(params)}`,
  );
}
/**
 * 查询安灯待判定完成列表
 * @param params
 */
export async function queryAndonPendingList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/listByUsered?${qs.stringify(params)}`,
  );
}
/**
 * 查询安灯待领取列表
 * @param params
 */
export async function queryAndonPendingPickList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/listByUser?${qs.stringify(params)}`,
  );
}
/**
 * 查询安灯待处理列表
 * @param params
 */
export async function fetchAndonPendingList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/listByUsered?${qs.stringify(params)}`,
  );
}
/**
 * 查询安灯已完成列表
 * @param params
 */
export async function queryAndonCompletedList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/searchFinish?${qs.stringify(params)}`,
  );
}
/**
 * 查询安灯异常列表
 */
export async function queryErrorType() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/errorType/listAndon`,
  );
}
/**
 * 查看备注
 * @param params
 */
export async function queryRemark(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/queryById/${params}`,
  );
}
/**
 * 安灯评价
 * @param params
 */
export async function anDengSEvaluation(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/evaluate/insert`,
    params,
  );
}

/**
 * 签到
 * @param params
 */
export async function andonSign(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/sign/insert`,
    params,
  );
}

/**
 * 签到人查询
 * @param id
 */
export async function queryTheEmployeeNumber(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/sign/queryById/${id}`,
  );
}

/**
 * 异常判定
 * @param params
 */
export async function anomalyDetermination(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/insert`,
    params,
  );
}

/**
 * 任务领取
 * @param id
 */
export async function taskCollection(id: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/update/${id}`,
    {},
  );
}

/**
 * 异常填报
 * @param params
 */
export async function abnormalFilling(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/abnormal`,
    params,
  );
}
/**
 * 问题处理
 * @param params
 */
export async function problemHandling(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/andon/trigger/handle/solve`,
    params,
  );
}
