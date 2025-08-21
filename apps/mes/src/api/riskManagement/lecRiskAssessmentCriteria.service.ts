// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询风险评估列表
 */
export async function lecList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/risk/lec/list?${qs.stringify(params)}`,
  );
}
/**
 * 新增风险评估
 */
export async function lecInsert(params: any) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/risk/lec/insert`,
    params,
  );
}
/**
 * 更新风险评估
 */
export async function lecUpdate(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/risk/lec/update`,
    params,
  );
}
/**
 * 删除风险评估
 */
export async function lecDelete(params: any) {
  return requestClient.delete<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/risk/lec/delete/${params}`,
  );
}
