// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工艺路线详情列表
 */
export async function queryProcessRouteDetailList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeDetail/getDetailList?${qs.stringify(
      params,
    )}`,
  );
}
/**
 * 工艺路线详情排序
 */
export async function processSort(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeDetail/saveMove`,
    params,
  );
}
