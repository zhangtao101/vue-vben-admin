// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询工艺路线列表
 */
export async function queryProcessRouteList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/getRouteList?${qs.stringify(
      params,
    )}`,
  );
}

/**
 * 查询工艺路线详情
 */
export async function queryRouterDetails(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/queryById/${params}`,
  );
}

/**
 * 更新工艺路线使用状态
 */
export async function updateProcessRouteUse(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/updateUse`,
    params,
  );
}

/**
 * 新增工艺路线
 */
export async function addProcessRoute(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/insert`,
    params,
  );
}

/**
 * 更新工艺路线
 */
export async function updateProcessRoute(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/update`,
    params,
  );
}
