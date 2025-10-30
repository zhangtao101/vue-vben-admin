// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 用户查询
 */
export async function listUser(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/listUser?${qs.stringify(params)}`,
  );
}
/**
 * 新增用户信息
 */
export async function insertUser(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/insertUser`,
    params,
  );
}
/**
 * 修改用户信息
 */
export async function updateArticle(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/updateUser`,
    params,
  );
}
/**
 * 重置密码
 */
export async function resetPassword(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/resetPassword/${params}`,
    params,
  );
}

/**
 * 删除用户信息
 * @param params 用户编号
 */
export async function deleteUser(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/deleteUser/${params}`,
  );
}
