// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 获取首检巡检末检角标对应的数量
 */
export function getCheckCounts(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getQcFormTaskCount?${qs.stringify(params)}`,
  );
}

/**
 * 获取质量待领取任务列表总数 显示待领取角标总数
 */
export function getQualityPendingTasksCount(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getWaiteAllQcFormCount?${qs.stringify(params)}`,
  );
}

/**
 * 获取质量待领取任务列表总数 显示待领取角标总数
 */
export function getQualityPendingTasks(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getWaiteAllQcForm?${qs.stringify(params)}`,
  );
}

/**
 * 获取质量待处理任务列表
 */
export function getAllQcForm(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getAllQcForm?${qs.stringify(params)}`,
  );
}
/**
 * 获取质量待处理任务列表总数 待处理显示角标总数
 */
export function getAllQcFormCount(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getAllQcFormCount?${qs.stringify(params)}`,
  );
}

/**
 * 获取质量已完成任务列表
 */
export function getAllFinishQcForm(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getAllFinishQcForm?${qs.stringify(params)}`,
  );
}
/**
 * 获取质量已完成任务列表总数 显示待领取角标总数
 */
export function getAllFinishQcFormCount(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getAllFinishQcFormCount?${qs.stringify(params)}`,
  );
}
/**
 * 任务领取
 */
export function applyTask(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/applyTask`,
    params,
  );
}

/**
 * 获取任务对应质检项目
 */
export function getAllStandardByCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getAllStandardByCode?${qs.stringify(params)}`,
  );
}

/**
 * 获取质检项的列表
 */
export function getAllStandard(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getAllStandard?${qs.stringify(params)}`,
  );
}

/**
 * 获取质检表单模板列表
 */
export function getAllQcFormByParam(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/getAllQcFormByParam?${qs.stringify(params)}`,
  );
}

/**
 * 任务完成
 */
export function taskStop(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/taskStop`,
    params,
  );
}
/**
 * 任务暂停
 */
export function taskClear(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/taskClear`,
    params,
  );
}

/**
 * 、任务审核
 */
export function taskAudit(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/qc/task/taskAudit`,
    params,
  );
}
