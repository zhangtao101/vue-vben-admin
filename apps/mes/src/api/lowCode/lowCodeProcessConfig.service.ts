// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 条件查询流程定义列表（分页）
 */
export async function queryFlowDefinitionList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowDefinition/listByParam?${qs.stringify(params)}`,
  );
}

/**
 * 获取流程定义列表（不分页）
 */
export async function getFlowDefinitionList() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowDefinition/list`,
  );
}

/**
 * 获取流程定义详情
 */
export async function getFlowDefinitionById(id: number) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowDefinition/get/${id}`,
  );
}

/**
 * 保存/更新流程定义
 */
export async function saveFlowDefinition(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowDefinition/save`,
    params,
  );
}

/**
 * 删除流程定义
 */
export async function deleteFlowDefinition(id: number) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowDefinition/delete/${id}`,
  );
}

/**
 * 启停用流程定义
 */
export async function enableFlowDefinition(id: number, status: number) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowDefinition/enable/${id}?status=${status}`,
  );
}

/**
 * 获取可用参数
 */
export async function getAvailableParams(
  flowDefId: number,
  currentNodeId: string,
) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowDefinition/availableParams?${qs.stringify({ flowDefId, currentNodeId })}`,
  );
}

/**
 * 获取所有工步列表
 */
export async function listOpFunctionType() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_EASYCODE}/process/flowDefinition/listOpFunctionType`,
  );
}
