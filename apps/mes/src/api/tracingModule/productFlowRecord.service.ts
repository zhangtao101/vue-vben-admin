// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

// ========== 产品流转记录 ==========

/**
 * 分页查询产品流转记录列表
 * @param query 查询参数
 */
export async function getProductProceList(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/trace/product/getProceList?${qs.stringify(query)}`,
  );
}

// ========== 单条操作 ==========

/**
 * 根据参数查询产品流转详情
 * @param query 查询参数
 */
export async function getProductDetailByParam(query: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/trace/product/getDetailByParam?${qs.stringify(query)}`,
  );
}
