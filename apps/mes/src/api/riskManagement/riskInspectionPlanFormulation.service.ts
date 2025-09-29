// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询风险检查计划列表
 */
export async function planList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/plan/list?${qs.stringify(params)}`,
  );
}
/**
 * 新增风险检查计划
 */
export async function planInsert(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/plan/insert`,
    params,
  );
}
/**
 * 更新风险检查计划
 */
export async function planUpdate(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/plan/update`,
    params,
  );
}
/**
 * 更新风险检查计划
 */
export async function planDelete(id: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/plan/delete/${id}`,
  );
}
/**
 * 更新风险检查计划状态
 */
export async function planUpdateStatus(id: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/plan/updateIsUse/${id}`,
    {},
  );
}
/**
 * 查看风险检查计划详情
 */
export async function queryPlanDetail(id: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/riskcheck/plan/detail/${id}`,
    {},
  );
}
