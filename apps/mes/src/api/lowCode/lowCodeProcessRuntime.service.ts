// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 审批处理
 */
export async function approveRuntime(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowRuntime/approve`,
    params,
  );
}

/**
 * 完成节点（普通模块）
 */
export async function completeNodeRuntime(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowRuntime/completeNode`,
    params,
  );
}

/**
 * 获取流程实例详情
 */
export async function getInstanceDetailRuntime(flowInstId: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowRuntime/instanceDetail/${flowInstId}`,
  );
}

/**
 * 获取工步模块元数据
 */
export async function getModuleMetaRuntime(functionType: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowRuntime/moduleMeta/${functionType}`,
  );
}

/**
 * 保存草稿
 */
export async function saveDraftRuntime(
  flowInstId: number,
  nodeId: string,
  data: any,
) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowRuntime/saveDraft?${qs.stringify({ flowInstId, nodeId })}`,
    data,
  );
}

/**
 * 启动流程
 */
export async function startFlowRuntime(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowRuntime/start`,
    params,
  );
}

/**
 * 获取待办列表
 */
export async function getTaskListRuntime(assignee: string) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowRuntime/taskList?${qs.stringify({ assignee })}`,
  );
}
