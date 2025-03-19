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
