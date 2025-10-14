import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/getCurrentUser`,
  );
}
/**
 * 更新用户信息
 */
export async function updateUserInfo(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/updateUserInfo`,
    params,
  );
}
/**
 * 更新用户密码
 */
export async function updatePassword(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/updatePassword`,
    params,
  );
}
/**
 * 获取人员的信息
 */
export async function getInformationAboutPeople(workNumber: string) {
  return requestClient.get<UserInfo>(
    `${import.meta.env.VITE_GLOB_MES_USER}sys/person/workNumber/${workNumber}`,
  );
}
