// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工序树
 */
export async function getProcessTree() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/tree`,
  );
}

/**
 * 查询工序列表
 */
export async function queryProcessTable(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/search?${qs.stringify(params)}`,
  );
}
/**
 * 创建工序
 */
export async function createProcess(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/add`,
    params,
  );
}
/**
 * 更新工序
 */
export async function updateProcess(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/update`,
    params,
  );
}
/**
 * 删除工序
 */
export async function deleteProcess(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/delete/${params}`,
  );
}
/**
 * 导出工序
 */
export async function exportProcess(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/export/${params}`,
  );
}
/**
 * 查询工序详情
 */
export async function queryProcessDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/produce/process/detail/${params}`,
  );
}
