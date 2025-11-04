// eslint-disable-next-line n/no-extraneous-import
import qs from 'qs';

import { requestClient } from '#/api/request';

/**
 * 类别表格加载
 */
export function queryMaterialTypeList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialType/list/search?${qs.stringify(params)}`,
  );
}
/**
 * 物料信息表格加载
 */
export function queryMaterialInfoList(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/list/search?${qs.stringify(params)}`,
  );
}
/**
 * 根据id/code查询材料信息
 */
export function queryMaterialInfoDetail(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/detail/${params}`,
  );
}
/**
 * 根据id/code产品信息
 */
export function queryMaterialInfoProductReferences(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/productReferences/${params}`,
  );
}
/**
 * 更新名称到标签和IQC
 */
export function updateNameToLabelAndIQC(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/updateNameToLabelAndIQC/${params}`,
  );
}
/**
 * 查看详情
 */
export function queryMaterialInfoById(params: any) {
  return requestClient.get(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/getMaterialById?${qs.stringify(params)}`,
  );
}
/**
 * 修改信息
 * 原接口定义query参数为请求参数
 */
export function materialUpDownSafe(params: any) {
  return requestClient.put(
    `${import.meta.env.VITE_GLOB_MES_MAIN}/base/materialInfo/materialUpDownSafe?${qs.stringify(params)}`,
    params,
  );
}
