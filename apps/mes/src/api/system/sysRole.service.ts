// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询角色
 */
export async function getRoles(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/role/getRoles?${qs.stringify(params)}`,
  );
}

/**
 * 查询角色的web权限
 */
export async function fetchWeb(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/role/getWebPurview?${qs.stringify(params)}`,
  );
}
/**
 * 查询角色管理下拉
 */
export async function quXeryRoleManagementDropDown() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/role/getSelectInfo`,
  );
}

/**
 * 查询角色的web权限
 */
export async function fetchPda(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/role/getPdaPurview?${qs.stringify(params)}`,
  );
}

/**
 * 查询角色的web权限
 */
export async function fetchApp(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/role/getAppPurview?${qs.stringify(params)}`,
  );
}

/**
 * 新增角色
 */
export async function createRole(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/role/add`,
    params,
  );
}

/**
 * 编辑角色
 */
export async function updateRole(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/role/up`,
    params,
  );
}

/**
 * 根据id删除角色
 */
export async function deleteRoleById(id: string) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/role/delete?id=${id}`,
  );
}
