// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询库区
 * @param params
 */
export function queryWareArea(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareArea/search?${qs.stringify(params)}`,
  );
}

/**
 * 查询库区树
 * @param params
 */
export function queryWareAreaTree(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareArea/tree?${qs.stringify(params)}`,
  );
}

/**
 * 删除库区
 * @param params
 */
export function deleteWareArea(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareArea/delete/${params}`,
  );
}

/**
 * 根据ID查询库区
 * @param params
 */
export function queryWareAreaById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareArea/detail/${params}`,
  );
}
/**
 * 根据仓库ID查询库区列表
 * @param params
 */
export function queryWareAreaListByWarehouseId(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareArea/list/warehouseId/${params}`,
  );
}

/**
 * 新增库区
 * @param params
 */
export function insertWareArea(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareArea/add`,
    params,
  );
}

/**
 * 更新库区
 * @param params
 */
export function updateWareArea(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/wareArea/update`,
    params,
  );
}
