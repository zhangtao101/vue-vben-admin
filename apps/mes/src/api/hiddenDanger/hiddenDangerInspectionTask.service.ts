// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 展示所有没有指派给别人做的计划
 */
export async function taskListWill(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/taskListWill?${qs.stringify(params)}`,
  );
}
/**
 * 展示今天做过的任务
 */
export async function taskListEd(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/taskListEd?${qs.stringify(params)}`,
  );
}
/**
 * 展示今天未做的任务
 */
export async function taskList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/taskList?${qs.stringify(params)}`,
  );
}
/**
 * 全部任务
 */
export async function list(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/list?${qs.stringify(params)}`,
  );
}
/**
 * 查看详情
 */
export async function queryDetails(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/getBy/${id}`,
  );
}
/**
 * 指派
 */
export async function assigned(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/order`,
    params,
  );
}
/**
 * 领取
 */
export async function collect(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/collect/${params.id}`,
    params,
  );
}
/**
 * 修改
 */
export async function update(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/update`,
    params,
  );
}
/**
 * 删除任务
 */
export async function deleteTask(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hazardcheck/execution/delete/${id}`,
  );
}
