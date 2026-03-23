import { requestClient } from '#/api/request';

/**
 * 材料调拨单分页查询
 */
export async function fetchMaterialAllotList(params: any) {
  return requestClient.get<{ results: any[]; total: number }>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/transferForm/material/search`,
    { params },
  );
}

/**
 * 仓库下拉列表（材料相关）
 */
export async function fetchWarehouseMaterialList(params?: any) {
  return requestClient.get<any[]>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouse/list/all`,
    { params },
  );
}
