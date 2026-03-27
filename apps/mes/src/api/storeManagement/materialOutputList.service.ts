import { requestClient } from '#/api/request';

/**
 * 查询出库单列表
 */
export async function fetchMaterialOutputList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouseRecord/search`,
    { params },
  );
}

/**
 * 导出出库单
 */
export async function exportMaterialOutputList(params: any) {
  return requestClient.get<any>(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouseRecord/getExportPath`,
    { params },
  );
}
