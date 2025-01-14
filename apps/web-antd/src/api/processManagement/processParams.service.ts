// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工艺参数
 */
export async function queryProcessParam(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/query?${qs.stringify(
      params,
    )}`,
  );
}
/**
 * 查询工艺参数详情
 */
export async function queryProcessParamDetail(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/detail/${id}`,
  );
}
/**
 * 删除工艺参数
 */
export async function deleteProcessParam(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/delete/${id}`,
  );
}
/**
 * 新增工艺参数
 */
export async function addProcessParam(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/save`,
    params,
  );
}

/**
 * 修改工艺参数
 */
export async function updateProcessParam(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/update`,
    params,
  );
}

/**
 * 发起变更
 */
export async function processParamTempChange(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/tempChange`,
    params,
  );
}

/**
 * 启停用
 */
export async function processParamUpdateUse(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/updateUse`,
    params,
  );
}

/**
 * 审核
 */
export async function processParamAudit(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/param/audit`,
    params,
  );
}
