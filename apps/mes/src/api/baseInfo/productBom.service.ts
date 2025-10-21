// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询数据
 */
export function getProductBomList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/queryList?${qs.stringify(params)}`,
  );
}
/**
 * 根据code/id查询详情
 */
export function queryDetailsByCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/getDetailList/${params}`,
  );
}
/**
 * 根据code/id查询详情树
 */
export function queryDetailsTreeByCode(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/equipment/productbom/queryDetailTree/${params}`,
  );
}
