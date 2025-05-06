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
