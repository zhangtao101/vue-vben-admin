// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';
/**
 * 查询动火信息
 * @param params 参数
 */
export function applyList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hotwork/apply/list?${qs.stringify(params)}`,
  );
}
/**
 * 更新
 * @param params 参数
 */
export function updateApply(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hotwork/apply/update`,
    params,
  );
}
/**
 * 申请部门负责人审批
 * @param params 参数
 */
export function applyUpdate(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hotwork/apply/applyUpdate`,
    params,
  );
}
/**
 * 安全部门审批
 * @param params 参数
 */
export function safeUpdate(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hotwork/apply/safeUpdate`,
    params,
  );
}
/**
 * 公司分管领导审批
 * @param params 参数
 */
export function leaderUpdate(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hotwork/apply/leaderUpdate`,
    params,
  );
}

/**
 * 删除动火信息
 * @param params 参数
 */
export function applyDelete(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/hotwork/apply/delete/${params}`,
  );
}
