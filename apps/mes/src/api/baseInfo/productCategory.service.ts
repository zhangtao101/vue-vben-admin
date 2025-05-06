// import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询类别列表
 * @param params
 */
export async function queryCategoryList(params: {
  data: any;
  pageNum: number;
  pageSize: number;
}) {
  return requestClient.post<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/erpProductType/getList?pageNum=${params.pageNum}&pageSize=${params.pageSize}`,
    params.data,
  );
}
/**
 * 查询类别树
 * @param params
 */
export async function queryCategoryTree() {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/erpProductType/getTree`,
  );
}
