// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 按货位查询库存记录（表格列表1）
 * @param query 查询参数
 */
export function queryScadaWarehouseStockByLocation(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/materialRecord/getRecordByLocation?${qs.stringify(query)}`,
  );
}

/**
 * 查询库存明细（表格列表2）
 * @param query 查询参数
 */
export function queryScadaWarehouseStockDetail(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/materialRecord/getRecordDetail?${qs.stringify(query)}`,
  );
}

/**
 * 物理仓库树（物理左树）
 * @param query 查询参数
 */
export function queryScadaPhysicalWarehouseTree() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/wareLocation/getTree`,
  );
}

/**
 * 逻辑仓库树（逻辑左树）
 * @param query 查询参数
 */
export function queryScadaLogicalWarehouseTree() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/logicalWarehouse/list/Material`,
  );
}

/**
 * 按材料导出库存
 * @param query 查询参数
 */
export function exportScadaWarehouseStockByMaterial(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/materialRecord/exportMaterial?${qs.stringify(query)}`,
  );
}

/**
 * 按标签导出库存明细
 * @param query 查询参数
 */
export function exportScadaWarehouseStockByLabel(query: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/materialRecord/exportMaterialDetailed?${qs.stringify(query)}`,
  );
}
