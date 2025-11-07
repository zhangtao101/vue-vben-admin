// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询物理仓库
 * @param params
 */
export function queryPhysicalWarehouse(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouse/search?${qs.stringify(params)}`,
  );
}
/**
 * 查询所有物理仓库
 */
export function queryAllPhysicalWarehouse() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouse/list/all`,
  );
}

/**
 * 删除物理仓库
 * @param params
 */
export function deletePhysicalWarehouse(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouse/delete/${params}`,
  );
}
/**
 * 根据ID查询物理仓库
 * @param params
 */
export function queryPhysicalWarehouseById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouse/id/${params}`,
  );
}

/**
 * 新增物理仓库
 * @param params
 */
export function insertPhysicalWarehouse(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouse/insert`,
    params,
  );
}

/**
 * 更新物理仓库
 * @param params
 */
export function updatePhysicalWarehouse(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouse/update`,
    params,
  );
}
