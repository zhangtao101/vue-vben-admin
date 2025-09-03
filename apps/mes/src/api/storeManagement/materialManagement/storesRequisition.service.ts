// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 查询领料申请单
 * @param params
 */
export function queryStoreRequisition(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/search?${qs.stringify(params)}`,
  );
}
/**
 * 查询领料申请单
 */
export function queryStoreRequisitionTyle() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/typeList`,
  );
}
/**
 * 查询领料单详情
 */
export function queryStoreRequisitionDetail(id: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/detail/${id}`,
  );
}
/**
 * 根据申请部门获取对应的线边仓库位
 */
export function listWarehouseCodeByOrgCode(orgCode: string) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/listWarehouseCodeByOrgCode/${orgCode}`,
  );
}

/**
 * 锁定
 */
export function storeRequisitionLock(params: any, bol = false) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/lock/${bol}`,
    params,
  );
}

/**
 * 签发
 */
export function storeRequisitionSign(params: any, bol = false) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/sign/${bol}`,
    params,
  );
}
/**
 * 线边仓调拨签发
 */
export function offlineSideWarehouseTransferAndIssuance(
  params: any,
  bol = false,
) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/xbcDbsign/${bol}`,
    params,
  );
}

/**
 * 中止
 */
export function storeRequisitionSuspend(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/suspend`,
    params,
  );
}
/**
 * 取消中止
 */
export function storeRequisitionCancelSuspend(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/cancelSuspend`,
    params,
  );
}
/**
 * 删除
 */
export function storeRequisitionDelete(id: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/delete/${id}`,
  );
}
/**
 * 新增
 */
export function storeRequisitionInsert(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/insert`,
    params,
  );
}
/**
 * 编辑
 */
export function storeRequisitionUpdate(params: any) {
  return requestClient.post(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/update`,
    params,
  );
}
/**
 * 获取物料树
 */
export function materialTypeGetTree() {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialType/getTree`,
  );
}
/**
 * 获取物料
 */
export function materialTypeGetByMaterialCodeAndName(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/getByMaterialCodeAndName?${qs.stringify(params)}`,
  );
}

/**
 * 获取物料库存数
 */
export function warehouseRecordWarehouseRecordStoreNumber(code: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/warehouseRecord/storeNumber/${code}`,
  );
}
/**
 * 整单删除
 */
export function wholeOrderDelete(applyCode: any) {
  return requestClient.delete(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/wms/storeRequisition/WholeOrderDelete?applyCode=${applyCode}`,
  );
}
