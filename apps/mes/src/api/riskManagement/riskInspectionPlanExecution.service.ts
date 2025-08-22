// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 展示所有没有指派给别人做的计划 risk
 */
export async function taskListWillRisk(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/taskListWill?${qs.stringify(params)}`,
  );
}
/**
 * 展示今天做过的任务
 */
export async function taskListEdRisk(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/taskListEd?${qs.stringify(params)}`,
  );
}
/**
 * 展示今天未做的任务
 */
export async function taskListRisk(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/taskList?${qs.stringify(params)}`,
  );
}
/**
 * 全部任务
 */
export async function listRisk(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/list?${qs.stringify(params)}`,
  );
}
/**
 * 查看详情
 */
export async function queryDetailsRisk(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/getBy/${id}`,
  );
}
/**
 * 指派
 */
export async function assignedRisk(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/order`,
    params,
  );
}
/**
 * 领取
 */
export async function collectRisk(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/collect/${params.id}`,
    params,
  );
}
/**
 * 修改
 */
export async function updateRisk(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/update`,
    params,
  );
}
/**
 * 删除任务
 */
export async function deleteTaskRisk(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/execution/delete/${id}`,
  );
}
