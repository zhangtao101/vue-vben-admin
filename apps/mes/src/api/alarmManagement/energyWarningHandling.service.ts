// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获用户警告信息
 */
export async function getAWarningMessageFromTheUser(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/simple/andon/tasks?${qs.stringify(params)}`,
  );
}
/**
 * 获用任务数量信息
 */
export async function informationOnTheNumberOfTasksUsed() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/simple/andon/tasksNumber`,
  );
}
/**
 * 获取警告类型
 */
export async function getTheWarningType() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/simple/andon/alarmType`,
  );
}
/**
 * 处理结果
 */
export async function processingResults(andonCode: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/simple/andon/detail/${andonCode}`,
  );
}

/**
 * 开始处理警告
 */
export async function startWorkingOnTheWarning(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/simple/andon/startHandle?${qs.stringify(params)}`,
  );
}

/**
 * 处理警告信息
 */
export async function handleWarningMessages(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_ENERGY}/simple/andon/handleWithImages`,
    params,
  );
}
