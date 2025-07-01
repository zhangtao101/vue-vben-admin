// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工艺路线
 */
export async function getRouteList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/getRouteList?${qs.stringify(params)}`,
  );
}
/**
 * 绑定工艺路线
 */
export async function bindingRoute(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/workstation/op/bindingRoute`,
    params,
  );
}
