// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询组织树
 */
export async function queryOrganizationTree() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/organization/listTree`,
  );
}
/**
 * 查询组织
 */
export async function queryOrganization(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/organization/listSysOrganization?${qs.stringify(params)}`,
  );
}
/**
 * 查看组织详情
 */
export async function viewOrganizationDetails(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/organization/sysOrganization/${id}`,
  );
}
/**
 * 组织编号查重
 */
export async function organizationNumberCheck(code: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/organization/${code}`,
  );
}
/**
 * 删除组织
 */
export async function delOrganization(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/organization/sysOrganization/${id}`,
  );
}
/**
 * 新增组织
 */
export async function addOrganization(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/organization/sysOrganization`,
    params,
  );
}
/**
 * 修改组织
 */
export async function updateOrganization(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/organization/sysOrganization`,
    params,
  );
}
/**
 * 设备台账履历查看
 * @param params pageNum 页码, pageSize 每页展示条数, equipmentCode 设备编号, eventType 事件类型 (1 状态变更 2 位置变动 3 故障记录 4 维修记录 5 点检保养记录)
 */
export async function queryLifecycleHistory(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/lifecycleHistory/selectPageByParams?${qs.stringify(params)}`,
  );
}
