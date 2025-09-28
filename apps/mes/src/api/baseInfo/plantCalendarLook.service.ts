// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询额外规则
 */
export function queryAdditionalRules(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/rule/getWorkshopCalendars?${qs.stringify(params)}`,
  );
}

/**
 * 删除额外规则
 */
export function deleteAdditionalRule(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/rule/delete?${qs.stringify(params)}`,
    {},
  );
}
/**
 * 新增额外规则
 */
export function addAdditionalRule(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/rule/insert`,
    params,
  );
}
/**
 * 修改额外规则
 */
export function updateAdditionalRule(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/rule/update`,
    params,
  );
}
/**
 * 根据id查询详情
 */
export function getAdditionalRuleDetail(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/calendar/rule/getById?${qs.stringify(params)}`,
  );
}
