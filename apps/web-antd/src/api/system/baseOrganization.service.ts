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
