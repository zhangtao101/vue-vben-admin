// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 出入库单据查看
 * @param params
 */
export function inboundAndOutboundDocumentsAreViewed(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/warehouseRecord/search?${qs.stringify(params)}`,
  );
}
/**
 * 出入库单据删除
 * @param params
 */
export function inboundAndOutboundDocumentsAreDeleted(params: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/warehouseRecord/deleteById?${qs.stringify(params)}`,
  );
}
/**
 * 出入库单据新增
 * @param params
 */
export function inboundAndOutboundDocumentsAreInserted(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/warehouseRecord/insert`,
    params,
  );
}
/**
 * 出入库单据更新
 * @param params
 */
export function inboundAndOutboundDocumentsAreUpdated(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/warehouseRecord/update`,
    params,
  );
}
/**
 * 出入库单据审核
 * @param params
 */
export function inboundAndOutboundDocumentsAreAudited(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_WMS}/wms/warehouseRecord/audit`,
    params,
  );
}

/**
 * 根据物料编码查询物料特征
 * @param params
 */
export function materialFeatureGetByMaterialCodeWith(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/base/materialFeature/getByMaterialCodeWithPage?${qs.stringify(params)}`,
  );
}
/**
 * 根据物料编码查询物料列表
 * @param params
 */
export function materialFeatureGetMaterialCodeList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_WMS}/base/materialInfo/getByMaterialCodeAndName?${qs.stringify(params)}`,
  );
}
