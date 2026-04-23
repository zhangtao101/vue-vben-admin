// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 获取资源列表
 * @param {Object} params - 查询参数
 * @param {string} [params.name] - 资源名称
 * @param {number} [params.pageNum] - 页码
 * @param {number} [params.pageSize] - 每页条数
 * @returns {Promise<any>} 包含资源列表和分页信息的 Promise
 */
export async function listResource(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/iot/resource/list?${qs.stringify(params)}`,
  );
}

/**
 * 新增资源
 * @param {Object} params - 新增参数
 * @param {string} params.name - 资源名称
 * @param {string} params.alink - 资源链接
 * @param {Array<{tenantCode: string, tenantName: string}>} params.tenants - 用户信息列表
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function insertResource(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/iot/resource/insert`,
    params,
  );
}

/**
 * 修改资源
 * @param {Object} params - 修改参数
 * @param {string} params.id - 资源ID
 * @param {string} params.name - 资源名称
 * @param {string} params.alink - 资源链接
 * @param {Array<{tenantCode: string, tenantName: string}>} params.tenants - 用户信息列表
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function updateResource(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/iot/resource/update`,
    params,
  );
}

/**
 * 删除资源
 * @param {string} id - 资源ID
 * @returns {Promise<any>} 操作结果的 Promise
 */
export async function deleteResource(id: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/iot/resource/${id}`,
  );
}

/**
 * 打开数据报表
 * @param {Object} params - 请求参数
 * @param {string} params.token - 用户 token
 * @returns {Promise<any>} 返回报表地址的 Promise
 */
export async function openReport(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_JM_REPORT}/jm/report`,
    { params },
  );
}

/**
 * 打开数据大屏
 * @param {Object} params - 请求参数
 * @param {string} params.token - 用户 token
 * @returns {Promise<any>} 返回大屏地址的 Promise
 */
export async function openBiScreen(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_JM_REPORT}/jm/bi`,
    { params },
  );
}
