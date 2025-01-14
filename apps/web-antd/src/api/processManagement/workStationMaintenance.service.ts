// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 *查询工作站列表
 */
export async function queryWorkstation(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/list?${qs.stringify(params)}`,
  );
}
/**
 *查询工作站详情
 */
export async function queryWorkstationDetail(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/queryById/${id}`,
  );
}
/**
 *删除工作站
 */
export async function delWorkstation(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/delete/${id}`,
  );
}
/**
 *添加工作站
 */
export async function addWorkstation(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/insert`,
    params,
  );
}
/**
 *修改工作站
 */
export async function editWorkstation(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/update`,
    params,
  );
}

/**
 *查询工作站操作配置详情
 */
export async function queryProcessSetDetailById(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/proceSetDetail/listById?id=${id}`,
  );
}

/**
 * 新增工作站操作配置详情
 */
export async function addProcessSetDetail(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/proceSetDetail/insert`,
    params,
  );
}
/**
 * 编辑工作站操作配置详情
 */
export async function editProcessSetDetail(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/proceSetDetail/update`,
    params,
  );
}
/**
 * 删除工作站操作配置详情
 */
export async function delProcessSetDetail(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/proceSetDetail/delete/${id}`,
  );
}
/**
 * 审核
 */
export async function workstationAudit(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/audit`,
    params,
  );
}
/**
 * 启停用
 */
export async function workstationUpdate(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/setRecord/updateUse`,
    params,
  );
}
