// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 分页查询产品追溯路线列表
 * @param query 查询参数
 */
export function queryScadaProductTraceList(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/route/getRouteList?${qs.stringify(query)}`,
  );
}

/**
 * 根据路线ID查询追溯明细列表（跳转后页面）
 * @param query 查询参数
 */
export function queryScadaProductTraceDetailList(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeTrace/getDetailList?${qs.stringify(query)}`,
  );
}

/**
 * 根据追溯明细ID查询单条记录（编辑弹窗回显）
 * @param id 追溯明细主键
 */
export function queryScadaProductTraceDetailById(id: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeTrace/queryById/${id}`,
  );
}

/**
 * 更新追溯明细
 * @param data 追溯明细数据
 */
export function updateScadaProductTraceDetail(data: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeTrace/update`,
    data,
  );
}

/**
 * 根据工序代码查询可配置质检项（质检设置表单）
 * @param processCode 工序代码
 */
export function queryScadaProductTraceQcByProcess(processCode: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/process/routeTrace/queryByProcessCode/${processCode}`,
  );
}
