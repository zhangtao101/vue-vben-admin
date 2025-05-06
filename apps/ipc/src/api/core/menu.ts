import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/ListMenuByToken`,
  );
}
