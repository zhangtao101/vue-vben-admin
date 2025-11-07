// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询库位
 * @param params
 */
export function queryWareLocation(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareLocation/search?${qs.stringify(params)}`,
  );
}
/**
 * 删除库位
 * @param params
 */
export function deleteWareLocation(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareLocation/delete/${params}`,
  );
}
/**
 * 根据ID查询库位
 * @param params
 */
export function queryWareLocationById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareLocation/detail/${params}`,
  );
}

/**
 * 新增库位
 * @param params
 */
export function insertWareLocation(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareLocation/add`,
    params,
  );
}

/**
 * 更新库位
 * @param params
 */
export function updateWareLocation(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareLocation/update`,
    params,
  );
}
