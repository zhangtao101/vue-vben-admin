// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询产品信息
 * @param params
 */
export async function queryErpProductArchivesList(params: {
  data: any;
  pageNum: number;
  pageSize: number;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/erpProductArchives/getList?pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
    params.data,
  );
}
/**
 * 查询产品详情
 * @param params
 */
export async function queryProductDetail(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/erpProductArchives/getByProductCode?${qs.stringify(params)}`,
  );
}
/**
 * 更新产品
 * @param params
 */
export async function updateProduct(params: any) {
  return requestClient.put<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/erpProductArchives/update`,
    params,
  );
}
