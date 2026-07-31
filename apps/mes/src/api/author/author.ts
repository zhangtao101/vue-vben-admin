// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * web菜单查询
 * @param params
 */
export async function getMenusWeb(params: {
  menuCode: string;
  type: 'pda' | 'web';
}) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/button/listButtonByRole?${qs.stringify(params)}`,
  );
}

/**
 * 验证是否有激活记录，返回成功表示激活成功
 */
export function getUserAuthorFlag() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/getUserAuthorFlag`,
  );
}

/**
 * 验证激活码
 * @param params 激活码
 */
export function testUserAuthor(params: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/testUserAuthor?authorCode=${params}`,
  );
}
